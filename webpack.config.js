module.exports = {
    entry: './src/js/app.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.min.js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.js$/,
            loader: 'babel-loader?presets[]=es2015'
        }]
    }
}