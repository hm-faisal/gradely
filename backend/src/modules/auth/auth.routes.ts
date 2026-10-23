import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authRateLimiter } from "../../middlewares/rateLimiter.middleware";
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
	authRateLimiter,
	validateRequest(registerSchema),
	authController.registerUser,
);

router.post(
	"/login",
	authRateLimiter,
	validateRequest(loginSchema),
	authController.loginUser,
);

router.patch(
	"/change-password",
	authenticate,
	authRateLimiter,
	validateRequest(changePasswordSchema),
	authController.changePassword,
);

export const authRoutes = router;
