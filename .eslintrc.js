module.exports = {
    root: true,
    env: {
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2021,
        project: './tsconfig.json',
    },
    extends: [
        '@namorzyny',
        '@namorzyny/eslint-config/typescript',
    ],
};
