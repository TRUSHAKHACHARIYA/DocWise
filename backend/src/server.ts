import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const app = Fastify({ logger: true });

app.register(cors, {
    origin: "http://localhost:3000",
});

app.register(helmet);

app.get("/", async () => {
    return { message: "DocWise API running 🚀" };
});

const start = async () => {
    try {
        await app.listen({ port: 4000 });
        console.log("🚀 Server running on http://localhost:4000");
    } catch (err) {
        process.exit(1);
    }
};

start();