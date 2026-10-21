import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
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
];

for (const item of moduleRoutes) {
	router.use(item.path, item.route);
}

export default router;
