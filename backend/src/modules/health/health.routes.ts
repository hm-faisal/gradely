import { Router } from "express";

const router: Router = Router();

router.get("/", (_req, res) => {
	res.status(200).json({
		data: {
			name: "Gradely Backend API",
			version: "1.0.0",
			status: "healthy",
			timestamp: new Date().toISOString(),
		},
		error: null,
	});
});

export const healthRoutes = router;
