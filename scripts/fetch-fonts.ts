import {DOWNLOAD_URL, REPO_PATH} from './constants';
import fetch from 'node-fetch';
import {writeFileSync} from 'fs';

export type FontList = Record<string, {
    name: string;
    version: string;
    url: string;
}>;

async function getFontList(): Promise<void> {
    console.log('Fetching font list...');
    const response = await fetch(DOWNLOAD_URL);
    if (!response.ok) throw new Error(`Unexpected response: ${response.statusText}`);
    const result = await response.text();
    const pattern = /https:\/\/github\.com\/ryanoasis\/nerd-fonts\/releases\/download\/v[\d.]+\/\w+\.zip/g;
    const urls = new Set<string>();
    for (const match of result.matchAll(pattern)) urls.add(match[0]);
    const fonts: FontList = {};
    Array.from(urls).forEach(url => {
        const segment = url.split('/');
        const fontName = segment.pop()!.slice(0, -4);
        const fontVersion = segment.pop()!.slice(1);
        fonts[fontName] = {
            name: fontName,
            version: fontVersion,
            url,
        };
    });
    console.log(`Retrieved ${Object.keys(fonts).length} fonts.`);
    writeFileSync(`${REPO_PATH}/fonts.json`, JSON.stringify(fonts, null, '    '));
}

getFontList().finally(() => null);
