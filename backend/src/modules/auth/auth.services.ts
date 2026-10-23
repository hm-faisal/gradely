import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../../errors";
import { db } from "../../prisma/db";
import { bcryptUtil } from "../../utils/bcrypt";
import { generateTokens } from "../../utils/jwt";

const { Role } = db.enums.public;

const register = async (payload: {
	name: string;
	email: string;
	password: string;
}) => {
	const { email } = payload;

	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		throw new BadRequestError("User already exists");
	}

	const user = await createUser(payload);
	if (!user) {
		throw new Error("Failed to create user");
	}
	const tokens = await generateTokens({
		id: user.id,
		email: user.email,
		role: user.role,
	});

	const { password: _password, ...safeUser } = user;

	return {
		user: safeUser,
		tokens,
	};
};

const login = async (payload: { email: string; password: string }) => {
	const user = await findUserByEmail(payload.email);

	if (!user) {
		throw new UnauthorizedError("Invalid email or password");
	}

	const isPasswordValid = await bcryptUtil.comparePassword(
		payload.password,
		user.password,
	);

	if (!isPasswordValid) {
		throw new UnauthorizedError("Invalid email or password");
	}

	const tokens = await generateTokens({
		id: user.id,
		email: user.email,
		role: user.role,
	});

	const { password: _password, ...safeUser } = user;

	return {
		user: safeUser,
		tokens,
	};
};
const me = async () => {};

const createUser = async (payload: {
	name: string;
	email: string;
	password: string;
}) => {
	const { name, email, password } = payload;
	const hashedPassword = await bcryptUtil.hashPassword(password);
	return db.orm.public.User.create({
		name,
		email,
		password: hashedPassword,
		role: Role.members.STUDENT,
	});
};
const findUserByEmail = async (email: string) => {
	return db.orm.public.User.where({ email }).first();
};
const findUserById = async (id: string) => {
	return db.orm.public.User.where({ id }).first();
};

const changePassword = async (
	id: string,
	payload: { oldPassword: string; newPassword: string },
) => {
	const user = await findUserById(id);

	if (!user) {
		throw new NotFoundError("User not found");
	}

	if (payload.oldPassword === payload.newPassword) {
		throw new BadRequestError(
			"New password must be different from the old password",
		);
	}

	const isPasswordValid = await bcryptUtil.comparePassword(
		payload.oldPassword,
		user.password,
	);

	if (!isPasswordValid) {
		throw new BadRequestError("Current password is incorrect");
	}

	const hashedPassword = await bcryptUtil.hashPassword(payload.newPassword);

	await db.orm.public.User.where({ id }).update({
		password: hashedPassword,
	});
};

export const authService = { register, login, changePassword, me };
