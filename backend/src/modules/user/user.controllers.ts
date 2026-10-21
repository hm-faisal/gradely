import type { Request, Response } from "express";
import httpStatus from "http-status";
import { BadRequestError } from "../../errors";
import { requireUser } from "../../middlewares/auth.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { UpdateUserInput } from "./user.schemas";
import { userService } from "./user.services";

const getMe = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const data = await userService.getMe(authUser.id);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User profile retrieved successfully",
		data,
	});
});

const updateUserInfo = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const payload = req.body as UpdateUserInput;
	const data = await userService.updateUserInfo(authUser.id, payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User information updated successfully",
		data,
	});
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
	const rawId = req.params.id;
	const id = Array.isArray(rawId) ? rawId[0] : rawId;

	if (!id) {
		throw new BadRequestError("User id is required");
	}

	const data = await userService.deleteUser(id);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User deleted successfully",
		data,
	});
});

export const userController = { getMe, updateUserInfo, deleteUser };
