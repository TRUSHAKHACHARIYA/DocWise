import { buildApp } from "./app";
import { env } from "./config/env";
import { initWorker } from "./services/queue";
// import * as Sentry from "@sentry/node";
/*
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0.2,
  });
}
*/

const app = buildApp({
    logger: true,
    bodyLimit: 50 * 1024 * 1024
});

const start = async () => {
    try {
        // initWorker(); // Start BullMQ worker (Disabled for local dev without Redis)
        await app.listen({ port: env.PORT, host: '0.0.0.0' });
        console.log(`🚀 Server running on port ${env.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();