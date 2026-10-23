import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PATH,
  getRoleHome,
  HOME_PATH,
  REVIEWER_PATH,
  STUDENT_PATH,
} from "@/constants/routes.constants";
import { getSessionUser } from "@/lib/auth";

// Optimistically routes users to the dashboard that matches their role based on
// the token payload. The backend still enforces every data operation.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getSessionUser(request);
  const isAdminRoute =
    pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  const isReviewerRoute =
    pathname === REVIEWER_PATH || pathname.startsWith(`${REVIEWER_PATH}/`);
  const isStudentRoute =
    pathname === STUDENT_PATH || pathname.startsWith(`${STUDENT_PATH}/`);

  if (!user) {
    // The home page is the public entry point (login/register).
    if (pathname === HOME_PATH) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  const roleHome = getRoleHome(user.role);

  // Signed-in users have no reason to see the auth page.
  if (pathname === HOME_PATH) {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (isAdminRoute && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (isReviewerRoute && user.role !== "REVIEWER") {
    return NextResponse.redirect(new URL(roleHome, request.url));
  }

  if (isStudentRoute && user.role === "REVIEWER") {
    return NextResponse.redirect(new URL(REVIEWER_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/me",
    "/me/:path*",
    "/admin",
    "/admin/:path*",
    "/reviewer",
    "/reviewer/:path*",
  ],
};
