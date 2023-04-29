import {REPO_PATH} from './constants';
import {
    readdirSync,
    readFileSync,
    rmSync,
    mkdirSync,
    writeFileSync,
} from 'fs';

type FontStyle = 'regular' | 'bold' | 'italic' | 'boldItalic';
type FontType = 'otf' | 'ttf';

const fontInfo = readdirSync(`${REPO_PATH}/downloads`)
    .filter(font => font !== 'NerdFontsSymbolsOnly')
    .map(font => {
        const files = readdirSync(`${REPO_PATH}/downloads/${font}`)
            .filter(file => file.includes('Complete.ttf'))
            .filter(file => !file.includes('Windows Compatible'));
        const regular = files.filter(
            file => !/Italic/i.test(file)
                && !/Heavy/i.test(file)
                && !/Light/i.test(file)
                && !/Condensed/i.test(file)
                && !/Medium/i.test(file)
                && !/Thin/i.test(file)
                && !/Italic/i.test(file)
                && !/Oblique/i.test(file)
                && !/Retina/i.test(file)
                && !/Black/i.test(file)
                && !/Bold/i.test(file)
                && !/Extra/i.test(file)
                && !/Semibold/i.test(file),
        );
        const bold = files.filter(
            file => / Bold /i.test(file)
                && !/Heavy/i.test(file)
                && !/Light/i.test(file)
                && !/Condensed/i.test(file)
                && !/Medium/i.test(file)
                && !/Thin/i.test(file)
                && !/Oblique/i.test(file)
                && !/Italic/i.test(file)
                && !/Extra/i.test(file)
                && !/Black/i.test(file),
        );
        const italic = files.filter(
            file => / Italic /i.test(file)
                && !/Heavy/i.test(file)
                && !/Light/i.test(file)
                && !/Condensed/i.test(file)
                && !/Medium/i.test(file)
                && !/Semibold/i.test(file)
                && !/Bold/i.test(file)
                && !/Thin/i.test(file)
                && !/Oblique/i.test(file)
                && !/Extra/i.test(file)
                && !/Black/i.test(file),
        );
        const boldItalic = files.filter(
            file => / Bold /i.test(file)
                && / Italic /i.test(file)
                && !/Heavy/i.test(file)
                && !/Light/i.test(file)
                && !/Condensed/i.test(file)
                && !/Medium/i.test(file)
                && !/Semibold/i.test(file)
                && !/Thin/i.test(file)
                && !/Oblique/i.test(file)
                && !/Extra/i.test(file)
                && !/Black/i.test(file),
        );
        return {font, regular, bold, italic, boldItalic};
    })
    .filter(font => font.regular.length > 0)
    .map(font => ({
        font: font.font,
        regular: font.regular[0],
        bold: font.bold[0],
        italic: font.italic[0],
        boldItalic: font.boldItalic[0],
    }));

function createCSSRule(
    fontFamily: string,
    fontStype: FontStyle,
    fontType: FontType,
    fontPath: string,
): string {
    return `@font-face {
    font-family: "${fontFamily}";
    font-style: ${
    {
        regular: 'normal',
        bold: 'normal',
        italic: 'italic',
        boldItalic: 'italic',
    }[fontStype]
};
    font-weight: ${
    {
        regular: 'normal',
        bold: 'bold',
        italic: 'normal',
        boldItalic: 'bold',
    }[fontStype]
};
    src: url(data:font/${fontType};charset-utf-8;base64,${readFileSync(
    fontPath,
    {encoding: 'base64'},
)});
}
`;
}

function generateStylesheet(): void {
    rmSync(`${REPO_PATH}/fonts`, {force: true, recursive: true});
    mkdirSync(`${REPO_PATH}/fonts`);
    fontInfo.forEach(font => {
        const rules = [
            createCSSRule(
                font.font,
                'regular',
                font.regular.slice(-3) as FontType,
                `${REPO_PATH}/downloads/${font.font}/${font.regular}`,
            ),
            font.bold
                ? createCSSRule(
                    font.font,
                    'bold',
                    font.bold.slice(-3) as FontType,
                    `${REPO_PATH}/downloads/${font.font}/${font.bold}`,
                )
                : '',
            font.italic
                ? createCSSRule(
                    font.font,
                    'italic',
                    font.italic.slice(-3) as FontType,
                    `${REPO_PATH}/downloads/${font.font}/${font.italic}`,
                )
                : '',
            font.boldItalic
                ? createCSSRule(
                    font.font,
                    'boldItalic',
                    font.boldItalic.slice(-3) as FontType,
                    `${REPO_PATH}/downloads/${font.font}/${font.boldItalic}`,
                )
                : '',
        ].join('');
        writeFileSync(`${REPO_PATH}/fonts/${font.font}.css`, rules, {
            encoding: 'utf8',
        });
        console.log(
            `Generated ${font.font}: ${[
                'Regular',
                font.bold ? ', Bold' : '',
                font.italic ? ', Italic' : '',
                font.boldItalic ? ', Bold Italic' : '',
            ].join('')}`,
        );
    });
}

generateStylesheet();
