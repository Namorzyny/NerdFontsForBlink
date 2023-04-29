import {REPO_PATH, FONT_LIST} from './constants';
import fetch from 'node-fetch';
import unzipper from 'unzipper';
import {FontList} from './fetch-list';
import {readFileSync, rmSync, mkdirSync} from 'fs';

interface DownloadedData {
    name: string;
    data: NodeJS.ReadableStream;
}

class Downloader {
    private readonly parallel: number;
    private downloading: number = 0;
    private queue: (() => void)[] = [];

    public constructor(parallel: number) {
        this.parallel = parallel;
    }

    public async download(name: string, url: string): Promise<DownloadedData | null> {
        await this.enqueue();
        let result: DownloadedData | null = null;
        try {
            result = await download(name, url);
        } catch (e) {
            console.error(`Failed to download ${name}.`);
        } finally {
            this.dequeue();
        }
        return result;
    }

    private async enqueue(): Promise<void> {
        if (this.downloading < this.parallel) {
            this.downloading++;
        } else {
            await new Promise<void>(resolve => this.queue.push(resolve));
        }
    }

    private dequeue(): void {
        this.downloading--;
        const next = this.queue.shift();
        if (next) next();
    }
}

async function download(name: string, url: string): Promise<DownloadedData> {
    const response = await fetch(url);
    console.log(`Downloading ${name}: ${url}`);
    if (!response.ok) throw new Error(`Unexpected response: ${response.statusText}`);
    console.log(`Downloaded ${name}...`);
    return {name, data: response.body};
}

function extract(name: string, stream: NodeJS.ReadableStream): Promise<void> {
    return new Promise(resolve => stream.pipe(unzipper.Extract({
        path: `${REPO_PATH}/downloads/${name}`,
    })).on('close', () => {
        console.log(`Extracted ${name}...`);
        resolve(undefined);
    }));
}

async function downloadFonts(): Promise<void> {
    rmSync(`${REPO_PATH}/downloads`, {force: true, recursive: true});
    mkdirSync(`${REPO_PATH}/downloads`);
    const fonts = JSON.parse(readFileSync(FONT_LIST, {encoding: 'utf8'})) as FontList;
    const downloader = new Downloader(5);
    const streams = await Promise.all(Object.keys(fonts).map(key => downloader.download(fonts[key].name, fonts[key].url)));
    await Promise.all(streams
        .filter(stream => stream !== null)
        .map(stream => extract(stream!.name, stream!.data)),
    );
}

downloadFonts().finally(() => null);
