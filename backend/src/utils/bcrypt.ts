import bcrypt from "bcryptjs";

const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
};
const comparePassword = async (password: string, hash: string) => {
	const match = await bcrypt.compare(password, hash);
	return match;
};

export const bcryptUtil = { hashPassword, comparePassword };
