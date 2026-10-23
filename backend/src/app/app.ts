import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import { envConfig } from "../config/env.config";
import { globalErrorHandler } from "../middlewares/globalErrorHandler.middleware";
import { notFoundHandler } from "../middlewares/notFound.middleware";
import { apiRateLimiter } from "../middlewares/rateLimiter.middleware";
import { sanitizeInput } from "../middlewares/sanitize.middleware";
import { healthRoutes } from "../modules/health/health.routes";
import appRoutes from "../routes";

export const createApp = (): Application => {
	const app = express();

	app.set("trust proxy", 1);

	app.use(
		cors({
			origin: envConfig.CORS_ORIGIN,
			credentials: true,
		}),
	);
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true, limit: "10mb" }));
	app.use(cookieParser());
	app.use(sanitizeInput);
	app.use(morgan("combined"));

	app.get("/", (_req: Request, res: Response) => {
		res.status(200).json({
			data: {
				name: "Gradely Backend API",
				version: "1.0.0",
				status: "healthy",
				timestamp: new Date().toISOString(),
			},
			error: null,
		});
	});

	app.use("/health", healthRoutes);
	app.use("/api/v1", apiRateLimiter);
	app.use("/api/v1", appRoutes);

	app.use(notFoundHandler);
	app.use(globalErrorHandler);

	return app;
};

export const app = createApp();
export default app;
