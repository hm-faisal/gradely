import "dotenv/config";
import { pathToFileURL } from "node:url";
import { bcryptUtil } from "../utils/bcrypt.ts";
import { getEnv } from "../utils/getEnv.ts";
import { connectDatabase, db } from "./db.ts";

const { Role } = db.enums.public;

const adminSeed = {
	name: getEnv("ADMIN_NAME", "Gradely Admin"),
	email: getEnv("ADMIN_EMAIL", "admin@gradely.com").trim().toLowerCase(),
	password: getEnv("ADMIN_PASSWORD", "Admin@12345"),
};

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
	await connectDatabase();

	const existingAdmin = await db.orm.public.User.where({
		email: adminSeed.email,
	})
		.select("id")
		.first();

	if (existingAdmin) {
		await db.orm.public.User.where({ id: existingAdmin.id }).update({
			role: Role.members.ADMIN,
		});
		return;
	}

	const hashedPassword = await bcryptUtil.hashPassword(adminSeed.password);

	await db.orm.public.User.create({
		name: adminSeed.name,
		email: adminSeed.email,
		password: hashedPassword,
		role: Role.members.ADMIN,
	});
}

export function seed(): Promise<void> {
	pendingSeed ??= runSeed().catch((error: unknown) => {
		pendingSeed = undefined;
		throw error;
	});
	return pendingSeed;
}

const isDirectRun =
	process.argv[1] !== undefined &&
	import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
	seed()
		.then(() => {
			console.log(`[Seed] Admin account ready: ${adminSeed.email}`);
		})
		.catch((error: unknown) => {
			console.error("[Seed] Failed to seed admin account:", error);
			process.exitCode = 1;
		})
		.finally(async () => {
			await db.close();
		});
}
