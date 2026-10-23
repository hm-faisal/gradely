import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { feedbackRoutes } from "../modules/feedback/feedback.routes";
import { submissionRoutes } from "../modules/submission/submission.routes";
import { userRoutes } from "../modules/user/user.routes";

type ModuleRoute = {
	path: string;
	route: Router;
};

const router: Router = Router();

const moduleRoutes: ModuleRoute[] = [
	{
		path: "/auth",
		route: authRoutes,
	},
	{
		path: "/users",
		route: userRoutes,
	},
	{
		path: "/submissions",
		route: submissionRoutes,
	},
	{
		path: "/feedbacks",
		route: feedbackRoutes,
	},
	{
		path: "/admin",
		route: adminRoutes,
	},
];

for (const item of moduleRoutes) {
	router.use(item.path, item.route);
}

export default router;
