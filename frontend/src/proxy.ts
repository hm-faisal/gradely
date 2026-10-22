import { getSessionUser } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

const HOME_PATH = "/";
const DASHBOARD_PATH = "/me";
const ADMIN_PATH = "/admin";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const user = getSessionUser(request);
	const isAdminRoute =
		pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);

	if (!user) {
		// The home page is the public entry point (login/register).
		if (pathname === HOME_PATH) {
			return NextResponse.next();
		}

		return NextResponse.redirect(new URL(HOME_PATH, request.url));
	}

	// Signed-in users have no reason to see the auth page.
	if (pathname === HOME_PATH) {
		const destination = user.role === "ADMIN" ? ADMIN_PATH : DASHBOARD_PATH;

		return NextResponse.redirect(new URL(destination, request.url));
	}

	if (isAdminRoute && user.role !== "ADMIN") {
		return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/me", "/me/:path*", "/admin", "/admin/:path*"],
};
