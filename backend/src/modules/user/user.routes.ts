import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
	validateQuery,
	validateRequest,
} from "../../middlewares/validateRequest.middleware";
import { userController } from "./user.controllers";
import {
	adminUpdateUserSchema,
	createReviewerSchema,
	listUsersQuerySchema,
	updateUserRoleSchema,
	updateUserSchema,
} from "./user.schemas";

const router: Router = Router();

router.get("/me", authenticate, userController.getMe);

router.patch(
	"/me",
	authenticate,
	validateRequest(updateUserSchema),
	userController.updateUserInfo,
);

router.get(
	"/",
	authenticate,
	authorize("ADMIN"),
	validateQuery(listUsersQuerySchema),
	userController.listUsers,
);

router.post(
	"/reviewers",
	authenticate,
	authorize("ADMIN"),
	validateRequest(createReviewerSchema),
	userController.createReviewer,
);

router.get("/:id", authenticate, authorize("ADMIN"), userController.getUser);

router.patch(
	"/:id",
	authenticate,
	authorize("ADMIN"),
	validateRequest(adminUpdateUserSchema),
	userController.updateUserByAdmin,
);

router.patch(
	"/:id/role",
	authenticate,
	authorize("ADMIN"),
	validateRequest(updateUserRoleSchema),
	userController.updateUserRole,
);

router.delete(
	"/:id",
	authenticate,
	authorize("ADMIN"),
	userController.deleteUser,
);

export const userRoutes = router;
export default userRoutes;
