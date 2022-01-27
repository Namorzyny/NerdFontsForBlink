import {REPO_PATH, FONT_LIST} from './constants';
import fetch from 'node-fetch';
import unzipper from 'unzipper';
import {FontList} from './fetch-fonts';
import {readFileSync, rmSync, mkdirSync} from 'fs';

interface DownloadedData {
    name: string;
    data: NodeJS.ReadableStream;
}

async function download(name: string, url: string): Promise<DownloadedData> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);
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
    const streams = await Promise.all(Object.keys(fonts).map(key => download(fonts[key].name, fonts[key].url)));
    await Promise.all(streams.map(stream => extract(stream.name, stream.data)));
}

downloadFonts().finally(() => null);
