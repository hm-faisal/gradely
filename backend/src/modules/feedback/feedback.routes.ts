import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
	validateQuery,
	validateRequest,
} from "../../middlewares/validateRequest.middleware";
import { feedbackController } from "./feedback.controllers";
import {
	listFeedbacksQuerySchema,
	updateFeedbackSchema,
} from "./feedback.schemas";

const router: Router = Router();

router.get(
	"/",
	authenticate,
	authorize("ADMIN"),
	validateQuery(listFeedbacksQuerySchema),
	feedbackController.listFeedbacks,
);

router.get(
	"/:id",
	authenticate,
	authorize("ADMIN"),
	feedbackController.getFeedback,
);

router.patch(
	"/:id",
	authenticate,
	authorize("ADMIN"),
	validateRequest(updateFeedbackSchema),
	feedbackController.updateFeedback,
);

export const feedbackRoutes = router;
export default feedbackRoutes;
