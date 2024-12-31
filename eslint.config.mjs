import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    eslintPluginPrettier,
    {
        rules: {
            'no-unused-vars': 'warn',
            'arrow-body-style': ['error', 'always'],
            'capitalized-comments': ['error', 'always'],
        },
    },
];
