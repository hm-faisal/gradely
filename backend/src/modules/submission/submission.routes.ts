import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
	validateQuery,
	validateRequest,
} from "../../middlewares/validateRequest.middleware";
import { submissionController } from "./submission.controllers";
import {
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
	validateRequest(createSubmissionSchema),
	submissionController.createSubmission,
);

router.get(
	"/",
	authenticate,
	authorize("ADMIN"),
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

router.patch(
	"/:id/review",
	authenticate,
	authorize("ADMIN"),
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
