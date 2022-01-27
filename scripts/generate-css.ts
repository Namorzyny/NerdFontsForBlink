import {REPO_PATH} from './constants';
import {readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync} from 'fs';

type FontStyle = 'regular' | 'bold' | 'italic' | 'boldItalic';
type FontType = 'otf' | 'ttf';

const fontInfo = readdirSync(`${REPO_PATH}/downloads`).map(font => {
    const files = readdirSync(`${REPO_PATH}/downloads/${font}`)
        .filter(file => file.includes('Complete Mono'))
        .filter(file => !file.includes('Windows Compatible'));
    const regular = files.filter(file => (!file.includes('Italic')
        && !file.includes('Heavy')
        && !file.includes('Light')
        && !file.includes('Condensed')
        && !file.includes('Medium')
        && !file.includes('Thin')
        && !file.includes('Italic')
        && !file.includes('Oblique')
        && !file.includes('Retina')
        && !file.includes('Black')
        && !file.includes('Bold')
        && !file.includes('Extra')
        && !file.includes('Semibold')
    ));
    const bold = files.filter(file => (file.includes(' Bold ')
        && !file.includes('Heavy')
        && !file.includes('Light')
        && !file.includes('Condensed')
        && !file.includes('Medium')
        && !file.includes('Thin')
        && !file.includes('Oblique')
        && !file.includes('Italic')
        && !file.includes('Extra')
        && !file.includes('Black')
    ));
    const italic = files.filter(file => (file.includes(' Italic ')
        && !file.includes('Heavy')
        && !file.includes('Light')
        && !file.includes('Condensed')
        && !file.includes('Medium')
        && !file.includes('Semibold')
        && !file.includes('Bold')
        && !file.includes('Thin')
        && !file.includes('Oblique')
        && !file.includes('Extra')
        && !file.includes('Black')
    ));
    const boldItalic = files.filter(file => (file.includes(' Bold ')
        && file.includes(' Italic ')
        && !file.includes('Heavy')
        && !file.includes('Light')
        && !file.includes('Condensed')
        && !file.includes('Medium')
        && !file.includes('Semibold')
        && !file.includes('Thin')
        && !file.includes('Oblique')
        && !file.includes('Extra')
        && !file.includes('Black')
    ));
    return {font, regular, bold, italic, boldItalic};
}).filter(font => ['bold', 'italic', 'boldItalic']
    .every(type => new Set((font[type as FontStyle]).map(file => file.slice(0, -4))).size < 2)
    && new Set(font.regular.map(file => file.slice(0, -4))).size === 1,
).map(font => ({
    font: font.font,
    regular: font.regular[0],
    bold: font.bold[0],
    italic: font.italic[0],
    boldItalic: font.boldItalic[0],
}));

function createCSSRule(fontFamily: string, fontStype: FontStyle, fontType: FontType, fontPath: string): string {
    return `@font-face {
    font-family: "${fontFamily}";
    font-style: ${{regular: 'normal', bold: 'normal', italic: 'italic', boldItalic: 'italic'}[fontStype]};
    font-weight: ${{regular: 'normal', bold: 'bold', italic: 'normal', boldItalic: 'bold'}[fontStype]};
    src: url(data:font/${fontType};charset-utf-8;base64,${readFileSync(fontPath, {encoding: 'base64'})});
}
`;
}

function generateStylesheet(): void {
    rmSync(`${REPO_PATH}/fonts`, {force: true, recursive: true});
    mkdirSync(`${REPO_PATH}/fonts`);
    fontInfo.forEach(font => {
        const rules = [
            createCSSRule(font.font, 'regular', font.regular.slice(-3) as FontType, `${REPO_PATH}/downloads/${font.font}/${font.regular}`),
            font.bold ? createCSSRule(font.font, 'bold', font.bold.slice(-3) as FontType, `${REPO_PATH}/downloads/${font.font}/${font.bold}`) : '',
            font.italic ? createCSSRule(font.font, 'italic', font.italic.slice(-3) as FontType, `${REPO_PATH}/downloads/${font.font}/${font.italic}`) : '',
            font.boldItalic ? createCSSRule(font.font, 'boldItalic', font.boldItalic.slice(-3) as FontType, `${REPO_PATH}/downloads/${font.font}/${font.boldItalic}`) : '',
        ].join('');
        writeFileSync(`${REPO_PATH}/fonts/${font.font}.css`, rules, {encoding: 'utf8'});
    });
}

generateStylesheet();
