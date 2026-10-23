import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { adminController } from "./admin.controllers";

const router: Router = Router();

router.get(
	"/summary",
	authenticate,
	authorize("ADMIN"),
	adminController.getSummary,
);

export const adminRoutes = router;
export default adminRoutes;
