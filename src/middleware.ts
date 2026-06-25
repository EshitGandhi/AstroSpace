import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes only signed-in users can access
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/blog/create(.*)",
  "/profile-setup(.*)",
  "/profile(.*)",
  "/kundli(.*)",
  "/booking(.*)",
  "/consultation(.*)",
]);

// Routes that should NOT be redirected to /profile-setup even if profile is incomplete
const isProfileExempt = createRouteMatcher([
  "/profile-setup(.*)",
  "/profile(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Protect API routes
  if (
    req.nextUrl.pathname.startsWith("/api/booking") ||
    (req.nextUrl.pathname === "/api/blog" && req.method === "POST")
  ) {
    auth().protect();
  }

  if (isProtectedRoute(req)) {
    auth().protect();
  }

  // If user is authenticated but has no profile cookie, redirect to /profile-setup
  const { userId } = auth();
  const profileComplete = req.cookies.get("profile_complete")?.value === "1";

  if (userId && !profileComplete && !isProfileExempt(req)) {
    const profileSetupUrl = new URL("/profile-setup", req.url);
    return NextResponse.redirect(profileSetupUrl);
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
