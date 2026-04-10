import { buildApp } from "./app";
import { env } from "./config/env";

const app = buildApp({
    logger: true,
    bodyLimit: 50 * 1024 * 1024
});

const start = async () => {
    try {
        await app.listen({ port: env.PORT, host: '0.0.0.0' });
        console.log(`🚀 Server running on port ${env.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();