import type { Request, Response } from "express";
import httpStatus from "http-status";
import { requireUser } from "../../middlewares/auth.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { setAuthCookies } from "../../utils/cookie";
import { sendResponse } from "../../utils/sendResponse";
import type {
	ChangePasswordInput,
	LoginInput,
	RegisterInput,
} from "./auth.schemas";
import { authService } from "./auth.services";

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body as RegisterInput;
	const data = await authService.register(payload);

	setAuthCookies(res, data.tokens);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "User registered successfully",
		data,
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body as LoginInput;
	const data = await authService.login(payload);

	setAuthCookies(res, data.tokens);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User logged in successfully",
		data,
	});
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const payload = req.body as ChangePasswordInput;

	await authService.changePassword(authUser.id, payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Password changed successfully",
		data: null,
	});
});

export const authController = { registerUser, loginUser, changePassword };
