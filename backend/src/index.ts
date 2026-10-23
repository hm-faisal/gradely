import "dotenv/config";
import { createServer, type Server } from "node:http";
import process from "node:process";
import "temporal-polyfill/full/global";
import app from "./app/app";
import { envConfig } from "./config/env.config.ts";
import { connectDatabase } from "./prisma/db.ts";

let server: Server | null = null;

const bootstrap = async () => {
	try {
		console.log(
			`[Bootstrap] Starting Gradely API in ${envConfig.NODE_ENV} mode...`,
		);

		if (envConfig.DATABASE_URL) {
			try {
				await connectDatabase();
				console.log("[PostgreSQL] Connected to database successfully.");
			} catch (dbError) {
				console.error("[PostgreSQL] Database connection error:", dbError);
			}
		} else {
			console.warn(
				"[PostgreSQL] DATABASE_URL is not set. Database queries will fail.",
			);
		}

		server = createServer(app);
		server.listen(envConfig.PORT, "0.0.0.0", () => {
			console.log(
				`Server running at http://localhost:${envConfig.PORT} (env: ${envConfig.NODE_ENV})`,
			);
		});
	} catch (error) {
		console.error("[Bootstrap] Fatal error during startup:", error);
		process.exit(1);
	}
};

const handleGracefulShutdown = async (signal: string) => {
	console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

	if (server) {
		server.close(async () => {
			console.log("[Server] HTTP server closed.");
			console.log("[Server] Graceful shutdown complete. Exiting.");
			process.exit(0);
		});

		setTimeout(() => {
			console.error("[Server] Forced shutdown due to timeout.");
			process.exit(1);
		}, 10000).unref();
	} else {
		process.exit(0);
	}
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
	console.error("[UnhandledRejection]:", reason);
});

process.on("uncaughtException", (error) => {
	console.error("[UncaughtException]:", error);
	process.exit(1);
});

bootstrap();
