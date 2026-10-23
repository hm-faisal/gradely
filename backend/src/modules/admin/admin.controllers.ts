import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.services";

const getSummary = catchAsync(async (_req: Request, res: Response) => {
	const data = await adminService.getAdminSummary();

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Admin summary retrieved successfully",
		data,
	});
});

export const adminController = { getSummary };
