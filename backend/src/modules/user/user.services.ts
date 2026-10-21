import { BadRequestError, NotFoundError } from "../../errors";
import { db } from "../../prisma/db";
import type { UpdateUserInput } from "./user.schemas";

const safeUserFields = [
	"id",
	"name",
	"email",
	"role",
	"status",
	"createdAt",
	"updatedAt",
] as const;

const getMe = async (id: string) => {
	const user = await db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.first();

	if (!user) {
		throw new NotFoundError("User not found");
	}

	return user;
};

const updateUserInfo = async (id: string, payload: UpdateUserInput) => {
	const { name, email } = payload;
	const existingUser = await db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.first();

	if (!existingUser) {
		throw new NotFoundError("User not found");
	}

	if (email && email !== existingUser.email) {
		const emailOwner = await db.orm.public.User.where({
			email: email,
		})
			.select("id")
			.first();

		if (emailOwner && emailOwner.id !== id) {
			throw new BadRequestError("Email is already in use");
		}
	}

	const updateData = {
		...(name !== undefined ? { name } : {}),
		...(email !== undefined ? { email } : {}),
	};

	return db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.update(updateData);
};

const deleteUser = async (id: string) => {
	const user = await db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.first();

	if (!user) {
		throw new NotFoundError("User not found");
	}

	await db.orm.public.User.where({ id }).delete();

	return user;
};

export const userService = { getMe, updateUserInfo, deleteUser };
