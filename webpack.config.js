const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// static files
const copyPatterns = [
    { from: "./src/media", to: "./media" },
    { from: "./src/data", to: "./data" }
]

const extractSass = new ExtractTextPlugin({
    filename: "styles.css"
});

module.exports = {
    entry: {
        mustload: './src/js/mustload.js',
        d3: './src/js/d3.js',
        app: './src/js/app.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './src/index.html',
            hash: true
        }),
        extractSass,
        new CopyWebpackPlugin(copyPatterns)
    ],
    module: {
        rules: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                        loader: 'css-loader',
                        options: {
                            // If you are having trouble with urls not resolving add this setting.
                            // See https://github.com/webpack-contrib/css-loader#url
                            url: false,
                            minimize: true,
                            sourceMap: false
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: false
                        }
                    }
                ]
            })
        }, {
            test: /\.js$/,
            loader: 'babel-loader?presets[]=es2015'
        }]
    }
}