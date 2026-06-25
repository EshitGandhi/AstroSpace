import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import UserProfileForm from "@/components/profile/UserProfileForm";
import { Star, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ProfileSetupPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Pre-fetch existing profile (for edit / return visits)
  const existingProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  // If user already has a complete profile, ensure the cookie is set
  // so middleware won't block them after they leave this page
  if (existingProfile?.profileComplete) {
    cookies().set("profile_complete", "1", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }


  const totalSteps = 6;
  const completedSteps = existingProfile
    ? [
        existingProfile.gender,
        existingProfile.dateOfBirth,
        existingProfile.birthCity,
        existingProfile.birthCountry,
        existingProfile.language,
        existingProfile.maritalStatus,
      ].filter(Boolean).length
    : 0;

  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-2 text-bhagva font-bold font-heading text-lg mb-6 hover:opacity-80 transition-opacity">
            <Star className="w-5 h-5 fill-current" />
            AstroGuru
          </Link>

          {/* Title block */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-bhagva/10 text-bhagva text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Personalize Your Experience
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink font-heading leading-tight">
                Complete Your<br />
                <span className="text-bhagva">Profile</span>
              </h1>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-md">
                Your birth details help us generate your personalized Kundli, horoscope, and provide accurate astrological guidance.
              </p>
            </div>

            {/* Circular progress */}
            <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-1">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#FCE9DA" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke="#E8590C"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPct / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-bhagva">
                  {progressPct}%
                </span>
              </div>
              <span className="text-xs text-ink-muted font-medium">Complete</span>
            </div>
          </div>

          {/* Linear progress bar (mobile) */}
          <div className="sm:hidden mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-ink-muted">{completedSteps} of {totalSteps} sections filled</span>
              <span className="text-xs font-bold text-bhagva">{progressPct}%</span>
            </div>
            <div className="h-2 bg-cream-tint rounded-full overflow-hidden">
              <div
                className="h-full bg-bhagva rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <UserProfileForm initialData={existingProfile} />

        {/* ── Skip link ── */}
        <div className="text-center mt-4 mb-8 lg:mb-0">
          <Link
            href="/dashboard"
            className="text-sm text-ink-muted hover:text-ink-muted/70 transition-colors underline underline-offset-4"
          >
            Skip for now — I&apos;ll complete this later
          </Link>
        </div>

      </div>
    </div>
  );
}
