const reactPlugin = require('eslint-plugin-react');
const reactNativePlugin = require('eslint-plugin-react-native');
const babelParser = require('@babel/eslint-parser');

module.exports = [
    {
        files: ['src/**/*.js', 'App.js'],
        languageOptions: {
            parser: babelParser,
            ecmaVersion: 2021,
            sourceType: 'module',
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: ['babel-preset-expo'],
                },
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: reactPlugin,
            'react-native': reactNativePlugin,
        },
        rules: {
            'react-native/no-raw-text': ['error', { skip: ['Text', 'SectionTitle'] }],
        },
    },
];
