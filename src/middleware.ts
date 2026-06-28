import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    if (!token) return NextResponse.next();

    const role = (token.role as string) || "USER";

    // 1. Authenticated users visiting auth pages → redirect to their respective dashboard
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/astrologer-register")) {
      if (role === "ASTROLOGER") return NextResponse.redirect(new URL("/pandit-dashboard", req.url));
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      const profileComplete = req.cookies.get("profile_complete")?.value === "1";
      if (profileComplete) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/profile-setup", req.url));
    }

    // 2. Role-based Route Protection
    if (pathname.startsWith("/pandit-dashboard") && role !== "ASTROLOGER") {
      return NextResponse.redirect(new URL(role === "USER" ? "/dashboard" : "/admin", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(role === "ASTROLOGER" ? "/pandit-dashboard" : "/dashboard", req.url));
    }
    
    // Protect normal user routes from Astrologer/Admin
    const userOnlyRoutes = ["/dashboard", "/profile-setup", "/profile", "/kundli", "/booking"];
    const isUserOnlyRoute = userOnlyRoutes.some(p => pathname.startsWith(p));
    if (isUserOnlyRoute && role !== "USER") {
      return NextResponse.redirect(new URL(role === "ASTROLOGER" ? "/pandit-dashboard" : "/admin", req.url));
    }

    // 3. Profile gate for USER role: authenticated but no profile_complete cookie → /profile-setup
    if (role === "USER") {
      const profileComplete = req.cookies.get("profile_complete")?.value === "1";
      const isProfileExempt =
        pathname.startsWith("/profile-setup") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/api");

      if (!profileComplete && !isProfileExempt) {
        return NextResponse.redirect(new URL("/profile-setup", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const protectedPaths = [
          "/dashboard",
          "/profile-setup",
          "/profile",
          "/kundli",
          "/booking",
          "/consult/session",
          "/wallet",
          "/blog/create",
          "/api/booking",
          "/api/profile",
          "/api/payments",
          "/api/wallet",
          "/api/consultation",
          "/pandit-dashboard",
          "/admin"
        ];

        const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
        if (isProtected && !token) return false;
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
