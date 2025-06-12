import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { API_AUTH_PREFIX, AUTH_ROUTES, PROTECTED_ROUTES } from "./routes";

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const pathname = req.nextUrl.pathname;

    // If the request is an API request (starting with /api), allow it to pass through
    if (pathname.startsWith("/api")) {
        return NextResponse.next();  // Let API routes pass without authentication checks
    }

    const isAuth = req.auth;

    const isAccessingApiAuthRoute = pathname.startsWith(API_AUTH_PREFIX);
    const isAccessingAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    const isAccessingProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

    // Skip middleware for specific routes like /form (or any other public route)
    const NotProtected = ['/form/'];

    if (NotProtected.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();  // Let public routes pass without authentication
    }

    // Allow API authentication routes to pass without authentication
    if (isAccessingApiAuthRoute) {
        return NextResponse.next();
    }

    // Authentication route handling
    if (isAccessingAuthRoute) {
        if (isAuth) {
            return NextResponse.redirect(new URL("/", req.nextUrl.origin)); // Redirect authenticated users away from login pages
        }
        return NextResponse.next(); // Proceed with the request to authentication routes
    }

    // Redirect to the sign-in page for protected routes if not authenticated
    if (!isAuth && isAccessingProtectedRoute) {
        return NextResponse.redirect(new URL("/signin", req.nextUrl.origin)); // Redirect non-authenticated users
    }

    // Otherwise, continue with the request
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],  // Ensure the matcher works for paths like /api
};
