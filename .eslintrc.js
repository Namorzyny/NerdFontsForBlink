module.exports = {
    root: true,
    env: {
        node: true,
    },
    parserOptions: {
        ecmaVersion: 'esnext',
        project: './tsconfig.json',
    },
    extends: [
        '@namorzyny',
        '@namorzyny/eslint-config/typescript',
    ],
    rules: {
        'no-shadow': 'off',
    }
};
