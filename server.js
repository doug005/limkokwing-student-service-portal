import express from 'express';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const staticDirectory = resolve(projectRoot, 'dist');
const applicationDocument = resolve(staticDirectory, 'index.html');
const app = express();

app.disable('x-powered-by');

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use(express.static(staticDirectory, { index: false, maxAge: 0 }));

// Let React Router handle page URLs, but never return HTML for a missing asset.
app.get(/.*/, (request, response, next) => {
  if (extname(request.path)) return next();
  response.sendFile(applicationDocument, (error) => {
    if (error) next(error);
  });
});

app.use((_request, response) => {
  response.status(404).type('text/plain').send('Not found');
});

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Limkokwing Student Service Portal listening on http://0.0.0.0:${port}`);
});
