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

interface Font {
    name: string;
    variants: Variant[];
}

interface Variant {
    name: string;
    regular: string;
    bold: string | null;
    italic: string | null;
    boldItalic: string | null;
}

const fontInfo: Font[] = readdirSync(`${REPO_PATH}/downloads`)
    .filter(font => font !== 'NerdFontsSymbolsOnly')
    .map(font => {
        const files = readdirSync(`${REPO_PATH}/downloads/${font}`)
            .filter(file => file.endsWith('.otf') || file.endsWith('.ttf'));
        return {
            name: font,
            variants: Array.from(new Set(files.map(name => name.substring(0, name.lastIndexOf('-'))))).map(variant => ({
                name: variant.replace('NerdFont', ''),
                regular: files.find(name => name.startsWith(`${variant}-Regular`))!,
                bold: files.find(name => name.startsWith(`${variant}-Bold`)) ?? null,
                italic: files.find(name => name.startsWith(`${variant}-Italic`)) ?? null,
                boldItalic: files.find(name => name.startsWith(`${variant}-BoldItalic`)) ?? null,
            })),
        };
    });

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
    rmSync(`${REPO_PATH}/fonts-v3`, {force: true, recursive: true});
    mkdirSync(`${REPO_PATH}/fonts-v3`);
    fontInfo.forEach(font => {
        mkdirSync(`${REPO_PATH}/fonts-v3/${font.name}`);
        font.variants.forEach(variant => {
            const rules = [
                createCSSRule(
                    variant.name,
                    'regular',
                    variant.regular.slice(-3) as FontType,
                    `${REPO_PATH}/downloads/${font.name}/${variant.regular}`,
                ),
                variant.bold
                    ? createCSSRule(
                        variant.name,
                        'bold',
                        variant.bold.slice(-3) as FontType,
                        `${REPO_PATH}/downloads/${font.name}/${variant.bold}`,
                    )
                    : '',
                variant.italic
                    ? createCSSRule(
                        variant.name,
                        'italic',
                        variant.italic.slice(-3) as FontType,
                        `${REPO_PATH}/downloads/${font.name}/${variant.italic}`,
                    )
                    : '',
                variant.boldItalic
                    ? createCSSRule(
                        variant.name,
                        'boldItalic',
                        variant.boldItalic.slice(-3) as FontType,
                        `${REPO_PATH}/downloads/${font.name}/${variant.boldItalic}`,
                    )
                    : '',
            ].join('');
            writeFileSync(`${REPO_PATH}/fonts-v3/${font.name}/${variant.name}.css`, rules, {
                encoding: 'utf8',
            });
            console.log(
                `Generated ${variant.name}: ${[
                    'Regular',
                    variant.bold ? ', Bold' : '',
                    variant.italic ? ', Italic' : '',
                    variant.boldItalic ? ', Bold Italic' : '',
                ].join('')}`,
            );
        });
    });
}

generateStylesheet();
