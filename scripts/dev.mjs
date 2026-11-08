import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import webpack from 'webpack';
import { createWebpackConfig, outputDirectory, projectRoot } from './build.mjs';

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const compiler = webpack(createWebpackConfig({ production: false, watch: true }));
const watching = compiler.watch({}, (error, stats) => {
  if (error) console.error(error);
  if (stats?.hasErrors()) console.error(stats.toString({ colors: true, modules: false }));
  else if (stats) console.log(stats.toString({ colors: true, modules: false }));
});

const serverProcess = spawn(process.execPath, [resolve(projectRoot, 'server.js')], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
});

let stopping = false;
async function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  watching.close(() => {});
  if (serverProcess.exitCode === null) serverProcess.kill(signal);
}
process.on('SIGINT', () => void stop('SIGINT'));
process.on('SIGTERM', () => void stop('SIGTERM'));
serverProcess.on('error', (error) => {
  console.error('Could not start the Node.js server:', error.message);
  void stop();
  process.exitCode = 1;
});
serverProcess.on('exit', async (code) => {
  await stop();
  process.exitCode = code ?? 0;
});
