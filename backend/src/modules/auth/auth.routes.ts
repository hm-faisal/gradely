import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { authController } from "./auth.controllers";
import {
	changePasswordSchema,
	loginSchema,
	registerSchema,
} from "./auth.schemas";

const router: Router = Router();

router.post(
	"/register",
	validateRequest(registerSchema),
	authController.registerUser,
);

router.post("/login", validateRequest(loginSchema), authController.loginUser);

router.patch(
	"/change-password",
	authenticate,
	validateRequest(changePasswordSchema),
	authController.changePassword,
);

export const authRoutes = router;
