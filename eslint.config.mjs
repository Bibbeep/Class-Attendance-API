import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    jsdoc.configs['flat/recommended'],
    eslintPluginPrettier,
    {
        rules: {
            'no-unused-vars': 'warn',
            'arrow-body-style': ['error', 'always'],
            'capitalized-comments': ['error', 'always'],
        },
    },
    {
        files: ['**/*.js'],
        plugins: {
            jsdoc,
        },
        rules: {
            'jsdoc/require-description': 'warn',
        },
    },
];
