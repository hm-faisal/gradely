import { or } from "@prisma/orm-postgres/orm-client";
import { BadRequestError, NotFoundError } from "../../errors";
import { db } from "../../prisma/db";
import { bcryptUtil } from "../../utils/bcrypt";
import { createPaginationMeta, getPagination } from "../../utils/pagination";
import type {
	AdminUpdateUserInput,
	CreateReviewerInput,
	ListUsersQuery,
	UpdateUserInput,
	UpdateUserRoleInput,
} from "./user.schemas";

const safeUserFields = [
	"id",
	"name",
	"email",
	"role",
	"status",
	"createdAt",
	"updatedAt",
] as const;

type UserFilters = {
	role?: "STUDENT" | "ADMIN" | "REVIEWER";
	status?: "ACTIVE" | "INACTIVE" | "BANNED" | "DELETED";
};

const countForUser = async (id: string) => {
	const [submissions, reviews, feedbacks] = await Promise.all([
		db.orm.public.Submission.where({ studentId: id }).aggregate(
			(aggregate) => ({
				total: aggregate.count(),
			}),
		),
		db.orm.public.Submission.where({ reviewerId: id }).aggregate(
			(aggregate) => ({
				total: aggregate.count(),
			}),
		),
		db.orm.public.Feedback.where({ reviewerId: id }).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
	]);

	return {
		submissions: submissions.total,
		reviews: reviews.total,
		feedbacks: feedbacks.total,
	};
};

const listUsers = async (query: ListUsersQuery) => {
	const filters: UserFilters = {};

	if (query.role) filters.role = query.role;
	if (query.status) filters.status = query.status;

	let collection =
		Object.keys(filters).length > 0
			? db.orm.public.User.where(filters)
			: db.orm.public.User;

	const search = (query.searchParam ?? query.search)?.toLowerCase();
	if (search) {
		collection = collection.where((user) =>
			or(user.name.ilike(`%${search}%`), user.email.ilike(`%${search}%`)),
		);
	}

	const { total } = await collection.aggregate((aggregate) => ({
		total: aggregate.count(),
	}));

	const { limit, offset } = getPagination(query);

	const items = await collection
		.select(...safeUserFields)
		.orderBy((user) => user.createdAt.desc())
		.limit(limit)
		.offset(offset)
		.all();

	return {
		items,
		meta: createPaginationMeta(query, total),
	};
};

const getUserById = async (id: string) => {
	const user = await db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.first();

	if (!user) {
		throw new NotFoundError("User not found");
	}

	return {
		...user,
		counts: await countForUser(id),
	};
};

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

const updateUserRole = async (
	id: string,
	actorId: string,
	payload: UpdateUserRoleInput,
) => {
	if (id === actorId) {
		throw new BadRequestError("You cannot change your own role");
	}

	const user = await db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.first();

	if (!user) {
		throw new NotFoundError("User not found");
	}

	return db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.update({ role: payload.role });
};

const updateUserByAdmin = async (
	id: string,
	actorId: string,
	payload: AdminUpdateUserInput,
) => {
	if (payload.role !== undefined && id === actorId) {
		throw new BadRequestError("You cannot change your own role");
	}

	if (payload.status !== undefined && id === actorId) {
		throw new BadRequestError("You cannot change your own status");
	}

	const existingUser = await db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.first();

	if (!existingUser) {
		throw new NotFoundError("User not found");
	}

	if (payload.email && payload.email !== existingUser.email) {
		const emailOwner = await db.orm.public.User.where({
			email: payload.email,
		})
			.select("id")
			.first();

		if (emailOwner && emailOwner.id !== id) {
			throw new BadRequestError("Email is already in use");
		}
	}

	const updateData = {
		...(payload.name !== undefined ? { name: payload.name } : {}),
		...(payload.email !== undefined ? { email: payload.email } : {}),
		...(payload.role !== undefined ? { role: payload.role } : {}),
		...(payload.status !== undefined ? { status: payload.status } : {}),
	};

	return db.orm.public.User.where({ id })
		.select(...safeUserFields)
		.update(updateData);
};

const createReviewer = async (payload: CreateReviewerInput) => {
	const existingUser = await db.orm.public.User.where({
		email: payload.email,
	})
		.select("id")
		.first();

	if (existingUser) {
		throw new BadRequestError("A user with this email already exists");
	}

	const hashedPassword = await bcryptUtil.hashPassword(payload.password);

	return db.orm.public.User.select(...safeUserFields).create({
		name: payload.name,
		email: payload.email,
		password: hashedPassword,
		role: "REVIEWER",
	});
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

export const userService = {
	listUsers,
	getUserById,
	getMe,
	updateUserInfo,
	updateUserRole,
	updateUserByAdmin,
	createReviewer,
	deleteUser,
};
