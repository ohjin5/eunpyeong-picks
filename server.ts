import 'dotenv/config';

import { createServer as createViteServer } from 'vite';

import app from './src/server/app.js';


const PORT =
  Number(process.env.PORT) || 3000;


// ============================================================
// LOCAL DEVELOPMENT SERVER
// ============================================================

async function startLocalServer() {
  const vite =
    await createViteServer({
      server: {
        middlewareMode: true,
      },

      appType: 'spa',
    });

  app.use(
    vite.middlewares
  );

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `[Eunpyeong Picks] Local server: http://localhost:${PORT}`
      );

      console.log(
        `[Eunpyeong Picks] Mock mode: ${
          process.env.USE_MOCK_DATA === 'true'
        }`
      );
    }
  );
}


// ============================================================
// START LOCAL SERVER
// ============================================================

startLocalServer().catch(
  (error) => {
    console.error(
      '[Eunpyeong Picks] Local server startup failed:',
      error
    );

    process.exit(1);
  }
);