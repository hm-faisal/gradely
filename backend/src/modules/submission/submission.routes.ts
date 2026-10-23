import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { submissionRateLimiter } from "../../middlewares/rateLimiter.middleware";
import {
	validateQuery,
	validateRequest,
} from "../../middlewares/validateRequest.middleware";
import { submissionController } from "./submission.controllers";
import {
	assignReviewerSchema,
	createSubmissionSchema,
	listMySubmissionsQuerySchema,
	listSubmissionsQuerySchema,
	reviewSubmissionSchema,
	updateSubmissionSchema,
} from "./submission.schemas";

const router: Router = Router();

router.post(
	"/",
	authenticate,
	authorize("STUDENT"),
	submissionRateLimiter,
	validateRequest(createSubmissionSchema),
	submissionController.createSubmission,
);

router.get(
	"/",
	authenticate,
	authorize("ADMIN", "REVIEWER"),
	validateQuery(listSubmissionsQuerySchema),
	submissionController.listSubmissions,
);

router.get(
	"/me",
	authenticate,
	authorize("STUDENT", "ADMIN"),
	validateQuery(listMySubmissionsQuerySchema),
	submissionController.listMySubmissions,
);

router.post(
	"/auto-assign",
	authenticate,
	authorize("ADMIN"),
	submissionController.autoAssignReviewers,
);

router.patch(
	"/:id/assign",
	authenticate,
	authorize("ADMIN"),
	validateRequest(assignReviewerSchema),
	submissionController.assignReviewer,
);

router.patch(
	"/:id/review",
	authenticate,
	authorize("ADMIN", "REVIEWER"),
	validateRequest(reviewSubmissionSchema),
	submissionController.reviewSubmission,
);

router.get("/:id", authenticate, submissionController.getSubmission);

router.patch(
	"/:id",
	authenticate,
	validateRequest(updateSubmissionSchema),
	submissionController.updateSubmission,
);

router.delete("/:id", authenticate, submissionController.deleteSubmission);

export const submissionRoutes = router;
export default submissionRoutes;
