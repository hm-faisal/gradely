import type { Request, Response } from "express";
import httpStatus from "http-status";
import { BadRequestError } from "../../errors";
import { requireUser } from "../../middlewares/auth.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type {
	AdminUpdateUserInput,
	CreateReviewerInput,
	ListUsersQuery,
	UpdateUserInput,
	UpdateUserRoleInput,
} from "./user.schemas";
import { userService } from "./user.services";

const getParamId = (req: Request): string => {
	const rawId = req.params.id;
	const id = Array.isArray(rawId) ? rawId[0] : rawId;

	if (!id) {
		throw new BadRequestError("User id is required");
	}

	return id;
};

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

const listUsers = catchAsync(async (req: Request, res: Response) => {
	const query = req.validatedQuery as ListUsersQuery;
	const { items, meta } = await userService.listUsers(query);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Users retrieved successfully",
		data: items,
		meta,
	});
});

const getUser = catchAsync(async (req: Request, res: Response) => {
	const data = await userService.getUserById(getParamId(req));

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User retrieved successfully",
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

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const payload = req.body as UpdateUserRoleInput;
	const data = await userService.updateUserRole(
		getParamId(req),
		authUser.id,
		payload,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User role updated successfully",
		data,
	});
});

const updateUserByAdmin = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const payload = req.body as AdminUpdateUserInput;
	const data = await userService.updateUserByAdmin(
		getParamId(req),
		authUser.id,
		payload,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User information updated successfully",
		data,
	});
});

const createReviewer = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body as CreateReviewerInput;
	const data = await userService.createReviewer(payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Reviewer account created successfully",
		data,
	});
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
	const data = await userService.deleteUser(getParamId(req));

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User deleted successfully",
		data,
	});
});

export const userController = {
	getMe,
	listUsers,
	getUser,
	updateUserInfo,
	updateUserRole,
	updateUserByAdmin,
	createReviewer,
	deleteUser,
};
