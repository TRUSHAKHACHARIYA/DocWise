import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env } from "./config/env";
import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/documents";
import { chatRoutes } from "./routes/chat";

const app = Fastify({ logger: true });

app.register(cors, {
    origin: env.FRONTEND_URL,
});

app.register(helmet);

app.register(authRoutes, { prefix: '/api/auth' });
app.register(documentRoutes, { prefix: '/api/documents' });
app.register(chatRoutes, { prefix: '/api/chat' });

app.get("/", async () => {
    return { message: "DocWise API running 🚀" };
});

const start = async () => {
    try {
        await app.listen({ port: env.PORT });
        console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();