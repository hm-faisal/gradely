import { getEnv, getEnvNumber } from "../utils/getEnv";

export const envConfig = {
	PORT: getEnvNumber("PORT", 5000),
	NODE_ENV: getEnv("NODE_ENV", "development"),
	JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
	JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
	JWT_ACCESS_TOKEN_EXPIRY: getEnv("JWT_ACCESS_TOKEN_EXPIRY", "15m"),
	JWT_REFRESH_TOKEN_EXPIRY: getEnv("JWT_REFRESH_TOKEN_EXPIRY", "7d"),
	DATABASE_URL: getEnv("DATABASE_URL"),
	CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:3000"),
	RATE_LIMIT_WINDOW_MS: getEnvNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
	RATE_LIMIT_MAX: getEnvNumber("RATE_LIMIT_MAX", 100),
	AUTH_RATE_LIMIT_MAX: getEnvNumber("AUTH_RATE_LIMIT_MAX", 15),
};
