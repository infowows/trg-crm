import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
    "/login",
    "/api/auth/login",
    "/api/seed",
    "/api/create-admin",
    "/api/stats",
    "/api/employees",
    "/api/customers",
    "/api/quotations",
    "/api/services",
    "/api/positions",
    "/api/customer-classifications",
    "/api/customer-care",
    "/api/material-groups",
    "/api/service-pricing",
    "/api/care-types",
    "/api/service-packages",
    "/api/category-items",
    "/api/source-settings",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for authentication token
    const token = request.cookies.get("token")?.value;

    if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Allow access to protected routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
