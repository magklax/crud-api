import * as path from 'path';
import { Configuration } from 'webpack';
import nodeExternals from "webpack-node-externals";

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts'],
  },
  optimization: {
    minimize: false,
  },
};

export default config;