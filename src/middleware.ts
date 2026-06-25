import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Authenticated users visiting auth pages → redirect to dashboard
    if (token && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
      return NextResponse.redirect(new URL("/profile-setup", req.url));
    }

    // Profile gate: authenticated but no profile_complete cookie → /profile-setup
    const profileComplete = req.cookies.get("profile_complete")?.value === "1";
    const isProfileExempt =
      pathname.startsWith("/profile-setup") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/api");

    if (token && !profileComplete && !isProfileExempt) {
      return NextResponse.redirect(new URL("/profile-setup", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run middleware logic on protected routes
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const protectedPaths = [
          "/dashboard",
          "/profile-setup",
          "/profile",
          "/kundli",
          "/booking",
          "/consultation",
          "/blog/create",
          "/api/booking",
          "/api/profile",
          "/api/payments",
        ];

        const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
        if (isProtected && !token) return false; // triggers redirect to signIn page
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
