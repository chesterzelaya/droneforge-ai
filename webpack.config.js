const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serving static files from 'public' directory
    },
    hot: true, // Enables hot module replacement
    historyApiFallback: true,
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' ws:;"
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'node_modules/ammo.js/builds/ammo.wasm.wasm'), to: 'ammo.wasm.wasm' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', 
        },
      },
      {
        test: /\.(glb|gltf)$/, 
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/models',
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
    ],
  },
  resolve: {
    fallback: {
      "fs": false, // Add fallback for 'fs' to prevent issues with 'ammo.js'
      "path": require.resolve("path-browserify"), // Use 'path-browserify' for browser environment
    },
    alias: {
      // Alias for GLTFLoader to use the right path for loading 3D models
      'three/examples/jsm/loaders/GLTFLoader': path.resolve(__dirname, 'node_modules/three/examples/jsm/loaders/GLTFLoader.js')
    }
  }
};