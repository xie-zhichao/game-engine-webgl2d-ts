"use strict";
var path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    output: { path: path.resolve(__dirname, 'dist'), filename: 'main.js', globalObject: 'this' },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    performance: {
        hints: false
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    },
    plugins: [
        new CopyPlugin([
            { from: path.join(__dirname, 'src/index.html'), to: path.join(__dirname, 'dist/index.html') },
            {
                from: path.join(__dirname, 'src/resource'),
                to: path.join(__dirname, 'dist/resource'),
                ignore: ['*.ts', '*.tsx', '*.js'],
            },
        ])
    ]
};
