import "dotenv/config";
import { getEnv, getEnvNumber } from "../utils/getEnv";

export const envConfig = {
	PORT: getEnvNumber("PORT", 5000),
	NODE_ENV: getEnv("NODE_ENV", "development"),
	DATABASE_URL: getEnv("DATABASE_URL"),
	CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:3000"),
};
