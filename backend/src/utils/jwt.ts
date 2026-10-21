import jwt, { type SignOptions } from "jsonwebtoken";
import { envConfig } from "../config/env.config";
import { db } from "../prisma/db";

const {
	Role: { members: userRoles },
} = db.enums.public;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

export type AccessTokenPayload = {
	id: string;
	email: string;
	role: UserRole;
};

const isUserRole = (value: unknown): value is UserRole =>
	Object.values(userRoles).includes(value as UserRole);

export const generateTokens = async (payload: AccessTokenPayload) => {
	const accessToken = jwt.sign(payload, envConfig.JWT_ACCESS_SECRET, {
		expiresIn: envConfig.JWT_ACCESS_TOKEN_EXPIRY,
	} as SignOptions);

	const refreshToken = jwt.sign(payload, envConfig.JWT_REFRESH_SECRET, {
		expiresIn: envConfig.JWT_REFRESH_TOKEN_EXPIRY,
	} as SignOptions);

	return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
	const decoded = jwt.verify(token, envConfig.JWT_ACCESS_SECRET);

	if (
		typeof decoded === "string" ||
		typeof decoded.id !== "string" ||
		typeof decoded.email !== "string" ||
		!isUserRole(decoded.role)
	) {
		throw new jwt.JsonWebTokenError("Invalid access token payload");
	}

	return {
		id: decoded.id,
		email: decoded.email,
		role: decoded.role,
	};
};
