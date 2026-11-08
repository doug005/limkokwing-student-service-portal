import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const outputDirectory = resolve(projectRoot, 'dist');

dotenv.config({ path: resolve(projectRoot, '.env') });
dotenv.config({ path: resolve(projectRoot, '.env.local'), override: true });

const firebaseVariables = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

export function createWebpackConfig({ production = true, watch = false } = {}) {
  const define = {
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
  };
  for (const name of firebaseVariables) {
    define[`process.env.${name}`] = JSON.stringify(process.env[name] ?? '');
  }

  return {
    mode: production ? 'production' : 'development',
    context: projectRoot,
    entry: resolve(projectRoot, 'src/main.jsx'),
    output: {
      path: outputDirectory,
      filename: 'assets/app.[contenthash:8].js',
      publicPath: '/',
      clean: true,
    },
    devtool: production ? false : 'source-map',
    watch,
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults, not IE 11' }],
                ['@babel/preset-react', { runtime: 'automatic', development: !production }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    resolve: { extensions: ['.js', '.jsx'] },
    plugins: [
      new webpack.DefinePlugin(define),
      new HtmlWebpackPlugin({ template: resolve(projectRoot, 'index.html') }),
      new MiniCssExtractPlugin({ filename: 'assets/app.[contenthash:8].css' }),
      new CopyWebpackPlugin({ patterns: [{ from: resolve(projectRoot, 'public'), to: '.' }] }),
    ],
    optimization: {
      splitChunks: { chunks: 'all' },
    },
    performance: { hints: false },
  };
}

function runWebpack(config) {
  return new Promise((resolveBuild, rejectBuild) => {
    webpack(config, (error, stats) => {
      if (error) return rejectBuild(error);
      if (stats.hasErrors()) return rejectBuild(new Error(stats.toString({ colors: true })));
      console.log(stats.toString({ colors: true, modules: false }));
      resolveBuild();
    });
  });
}

export async function buildClient() {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await runWebpack(createWebpackConfig({ production: true }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildClient();
}
