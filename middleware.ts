import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { API_AUTH_PREFIX, AUTH_ROUTES, PROTECTED_ROUTES } from "./routes";
export const { auth } = NextAuth(authConfig);

export default auth(req => {
    const pathname = req.nextUrl.pathname;

    // manage route protection
    const isAuth = req.auth;

    const isAccessingApiAuthRoute = pathname.startsWith(API_AUTH_PREFIX);
    const isAccessingAuthRoute: boolean = AUTH_ROUTES.some((route: string) => pathname.startsWith(route));
    const isAccessingProtectedRoute: boolean = PROTECTED_ROUTES.some((route: string) => pathname.startsWith(route));

    if (isAccessingApiAuthRoute) {
        return NextResponse.next();
    }

    if (isAccessingAuthRoute) {
        if (isAuth) {
            return NextResponse.redirect(new URL("/", req.nextUrl.origin));
        }

        return NextResponse.next();
    }

    if (!isAuth && isAccessingProtectedRoute) {
        return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
    }
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};