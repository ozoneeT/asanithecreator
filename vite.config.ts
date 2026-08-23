import path from 'path';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleVideos, handleUploadUrl, handleFinalize, handleDeleteVideo, handleStudioAuth, type ApiResult } from './lib/apiCore';

const readJsonBody = (req: Connect.IncomingMessage): Promise<Record<string, unknown>> =>
  new Promise(resolve => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });

/**
 * Serves the same handlers as the Vercel functions in api/* during `npm run dev`,
 * so the portfolio and studio behave identically locally and in production.
 */
const devApiPlugin = (): Plugin => ({
  name: 'asani-dev-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (!url.startsWith('/api/')) return next();

      const password = req.headers['x-studio-password'];
      const pw = Array.isArray(password) ? password[0] : password;

      let result: ApiResult;
      try {
        if (url === '/api/videos' && req.method === 'GET') {
          result = await handleVideos(pw);
        } else if (url === '/api/studio-auth' && req.method === 'POST') {
          result = await handleStudioAuth(pw);
        } else if (url === '/api/upload-url' && req.method === 'POST') {
          result = await handleUploadUrl(pw, await readJsonBody(req));
        } else if (url === '/api/finalize' && req.method === 'POST') {
          result = await handleFinalize(pw, await readJsonBody(req));
        } else if (url === '/api/delete-video' && req.method === 'POST') {
          result = await handleDeleteVideo(pw, await readJsonBody(req));
        } else {
          result = { status: 404, body: { error: 'Not found' } };
        }
      } catch (err) {
        server.config.logger.error(`[dev-api] ${String(err)}`);
        result = { status: 500, body: { error: 'Internal error' } };
      }

      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.body));
    });
  },
});

export default defineConfig(({ mode }) => {
  // Empty prefix loads unprefixed secrets (BUNNY_*, STUDIO_PASSWORD) too, so the
  // dev middleware above can read them from process.env.
  const env = loadEnv(mode, '.', '');
  Object.assign(process.env, env);

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), devApiPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
  };
});
