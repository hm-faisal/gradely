import { Router } from "express";

type ModuleRoute = {
	path: string;
	route: Router;
};

const router: Router = Router();

const moduleRoutes: ModuleRoute[] = [];

for (const item of moduleRoutes) {
	router.use(item.path, item.route);
}

export default router;
