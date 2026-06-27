import type { NextResponse } from "next/server";

export const PROFILE_COMPLETE_COOKIE = "profile_complete";

export function setProfileCompleteCookie(response: NextResponse): void {
  response.cookies.set(PROFILE_COMPLETE_COOKIE, "1", {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
