import type { Request, Response } from "express";
import httpStatus from "http-status";
import { BadRequestError } from "../../errors";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type {
	ListFeedbacksQuery,
	UpdateFeedbackInput,
} from "./feedback.schemas";
import { feedbackService } from "./feedback.services";

const getParamId = (req: Request): string => {
	const rawId = req.params.id;
	const id = Array.isArray(rawId) ? rawId[0] : rawId;

	if (!id) {
		throw new BadRequestError("Feedback id is required");
	}

	return id;
};

const listFeedbacks = catchAsync(async (req: Request, res: Response) => {
	const query = req.validatedQuery as ListFeedbacksQuery;
	const { items, meta } = await feedbackService.listFeedbacks(query);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Feedback retrieved successfully",
		data: items,
		meta,
	});
});

const getFeedback = catchAsync(async (req: Request, res: Response) => {
	const data = await feedbackService.getFeedbackById(getParamId(req));

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Feedback retrieved successfully",
		data,
	});
});

const updateFeedback = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body as UpdateFeedbackInput;
	const data = await feedbackService.updateFeedback(getParamId(req), payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Feedback updated successfully",
		data,
	});
});

export const feedbackController = {
	listFeedbacks,
	getFeedback,
	updateFeedback,
};
