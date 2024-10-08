const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Import du plugin

module.exports = {
    mode: 'production', // Ajoute cette ligne pour définir le mode
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',  // Fichier JavaScript généré
    },
    performance: {
        hints: 'warning', // Peut être 'warning' ou 'error'
        maxAssetSize: 500000, // Augmente la taille maximale d'un fichier (ici 500 Ko)
        maxEntrypointSize: 500000, // Augmente la taille maximale du point d'entrée (ici 500 Ko)
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader'
            }
        }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Fichier modèle si tu en as un
            filename: 'index.html', // Nom du fichier généré
        }),
    ],
};