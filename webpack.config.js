const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    hot: true,
    historyApiFallback: true,
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; " +
        "style-src 'self'; " +
        "img-src 'self' blob: data:; " +
        "connect-src 'self' blob: data: https://cdn.jsdelivr.net; " +
        "worker-src 'self' blob:; " +
        "wasm-src 'self' blob:;",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'node_modules/ammo.js/ammo.js'), to: 'ammo.js' },
        { from: 'public/assets', to: 'assets' },
        { from: 'public/assets/test_image.jpg', to: 'assets/test_image.jpg' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
    },
    alias: {
      'three/examples/jsm/loaders/GLTFLoader': path.resolve(
        __dirname,
        'node_modules/three/examples/jsm/loaders/GLTFLoader.js'
      ),
    },
    extensions: ['.js', '.jsx'],
  },
};
