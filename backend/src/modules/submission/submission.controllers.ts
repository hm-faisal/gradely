import type { Request, Response } from "express";
import httpStatus from "http-status";
import { BadRequestError } from "../../errors";
import { requireUser } from "../../middlewares/auth.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type {
	CreateSubmissionInput,
	ListMySubmissionsQuery,
	ListSubmissionsQuery,
	ReviewSubmissionInput,
	UpdateSubmissionInput,
} from "./submission.schemas";
import { submissionService } from "./submission.services";

const getParamId = (req: Request): string => {
	const rawId = req.params.id;
	const id = Array.isArray(rawId) ? rawId[0] : rawId;

	if (!id) {
		throw new BadRequestError("Submission id is required");
	}

	return id;
};

const createSubmission = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const payload = req.body as CreateSubmissionInput;
	const data = await submissionService.createSubmission(authUser, payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Submission created successfully",
		data,
	});
});

const listSubmissions = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const query = req.validatedQuery as ListSubmissionsQuery;
	const { items, meta } = await submissionService.listSubmissions(
		authUser,
		query,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Submissions retrieved successfully",
		data: items,
		meta,
	});
});

const listMySubmissions = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const query = req.validatedQuery as ListMySubmissionsQuery;
	const { items, meta } = await submissionService.listMySubmissions(
		authUser,
		query,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Your submissions retrieved successfully",
		data: items,
		meta,
	});
});

const getSubmission = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const id = getParamId(req);
	const data = await submissionService.getSubmissionById(id, authUser);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Submission retrieved successfully",
		data,
	});
});

const updateSubmission = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const id = getParamId(req);
	const payload = req.body as UpdateSubmissionInput;
	const data = await submissionService.updateSubmission(id, authUser, payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Submission updated successfully",
		data,
	});
});

const reviewSubmission = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const id = getParamId(req);
	const payload = req.body as ReviewSubmissionInput;
	const data = await submissionService.reviewSubmission(id, authUser, payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Submission reviewed successfully",
		data,
	});
});

const deleteSubmission = catchAsync(async (req: Request, res: Response) => {
	const authUser = requireUser(req);
	const id = getParamId(req);
	const data = await submissionService.deleteSubmission(id, authUser);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Submission deleted successfully",
		data,
	});
});

export const submissionController = {
	createSubmission,
	listSubmissions,
	listMySubmissions,
	getSubmission,
	updateSubmission,
	reviewSubmission,
	deleteSubmission,
};
