import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { userController } from "./user.controllers";
import { updateUserSchema } from "./user.schemas";

const router: Router = Router();

router.get("/me", authenticate, userController.getMe);

router.patch(
	"/me",
	authenticate,
	validateRequest(updateUserSchema),
	userController.updateUserInfo,
);

router.delete(
	"/:id",
	authenticate,
	authorize("ADMIN"),
	userController.deleteUser,
);

export const userRoutes = router;
export default userRoutes;
