import * as path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  mode: 'production',
  externalsPresets: { node: true },
  entry: './src/index.ts',
  output: {
    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  optimization: {
    minimize: false,
  },
};

export default config;