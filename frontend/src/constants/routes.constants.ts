export const HOME_PATH = "/";
export const STUDENT_PATH = "/me";
export const ADMIN_PATH = "/admin";
export const REVIEWER_PATH = "/reviewer";

export const getRoleHome = (role: string): string => {
  if (role === "ADMIN") return ADMIN_PATH;
  if (role === "REVIEWER") return REVIEWER_PATH;

  return STUDENT_PATH;
};
