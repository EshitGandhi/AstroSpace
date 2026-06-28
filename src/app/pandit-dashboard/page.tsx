import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, ShieldAlert, CheckCircle2, User, ChevronRight, MessageSquare, IndianRupee, Calendar } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import OnlineToggle from "./OnlineToggle";

export default async function AstrologerDashboard() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return <div>Profile not found. Please contact support.</div>;
  }

  // Fetch stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingCount, todaySessions, todayEarnings] = await Promise.all([
    prisma.consultation.count({
      where: { panditId: profile.id, status: "PENDING" },
    }),
    prisma.consultation.count({
      where: {
        panditId: profile.id,
        status: "COMPLETED",
        endedAt: { gte: today },
      },
    }),
    prisma.consultation.aggregate({
      where: {
        panditId: profile.id,
        status: "COMPLETED",
        endedAt: { gte: today },
      },
      _sum: { totalCost: true },
    }),
  ]);

  const earningsToday = (todayEarnings._sum.totalCost || 0) / 100;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <GlassCard className="p-8 bg-gradient-to-br from-bhagva to-bhagva/90 text-white border-0 shadow-lg shadow-bhagva/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/20 flex-shrink-0 bg-white/10 flex items-center justify-center">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white/50" />
            )}
          </div>
          <div className="text-center sm:text-left mt-2 sm:mt-0 flex-1">
            <h1 className="text-3xl font-heading font-bold mb-2">
              Namaste, {session.user.name}
            </h1>
            <p className="text-white/80 max-w-lg">
              Welcome to your AstroGuru Partner Dashboard. Manage your consultations and guide seekers on their journey.
            </p>
          </div>
          {/* Online Toggle */}
          <div className="flex-shrink-0">
            <OnlineToggle profileId={profile.id} initialOnline={profile.isOnline} />
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </GlassCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/pandit-dashboard/consultations" className="group">
          <GlassCard className="p-6 flex items-center gap-4 hover:border-bhagva/30 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-bhagva group-hover:scale-110 transition-transform">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-ink">{pendingCount}</div>
              <div className="text-sm font-semibold text-ink-muted">Pending Requests</div>
            </div>
          </GlassCard>
        </Link>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-ink">{todaySessions}</div>
            <div className="text-sm font-semibold text-ink-muted">Today's Sessions</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
            <IndianRupee className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-ink">₹{earningsToday.toFixed(0)}</div>
            <div className="text-sm font-semibold text-ink-muted">Today's Earnings</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              Verification Status
            </h2>
            {profile.verificationStatus === "PENDING" && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 flex gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Review in Progress</h3>
                  <p className="text-sm mt-1 opacity-90">Your profile is currently under review by our team. You will be notified once approved.</p>
                </div>
              </div>
            )}
            {profile.verificationStatus === "APPROVED" && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Profile Approved</h3>
                  <p className="text-sm mt-1 opacity-90">Your account is verified and you can accept consultations.</p>
                </div>
              </div>
            )}
            {profile.verificationStatus === "REJECTED" && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Action Required</h3>
                  <p className="text-sm mt-1 opacity-90">There was an issue verifying your profile. Please check your email for details.</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Profile Completion */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              Profile Completion
            </h2>
            <div className="mb-2 flex justify-between text-sm font-medium text-ink-muted">
              <span>Progress</span>
              <span>{profile.profileCompletion}%</span>
            </div>
            <div className="h-2.5 w-full bg-ink/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-bhagva rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
            <p className="text-sm text-ink-muted mt-4">
              Complete your profile to increase your visibility and build trust with clients.
            </p>
          </div>
          <Link
            href="/pandit-dashboard/profile"
            className="mt-6 inline-flex items-center text-sm font-bold text-bhagva hover:text-bhagva/80 transition-colors"
          >
            Update Profile <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <section className="mt-8">
        <h2 className="text-xl font-bold font-heading mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/pandit-dashboard/consultations" className="p-4 bg-white border border-ink/10 rounded-2xl shadow-sm hover:border-bhagva/40 hover:shadow-md transition-all flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-full bg-cream-tint flex items-center justify-center text-bhagva group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="font-semibold text-ink text-sm">View Consultations</span>
          </Link>
          <Link href="/pandit-dashboard/profile" className="p-4 bg-white border border-ink/10 rounded-2xl shadow-sm hover:border-bhagva/40 hover:shadow-md transition-all flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-full bg-cream-tint flex items-center justify-center text-bhagva group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <span className="font-semibold text-ink text-sm">Edit Profile</span>
          </Link>
          <Link href="/pandit-dashboard/wallet" className="p-4 bg-white border border-ink/10 rounded-2xl shadow-sm hover:border-bhagva/40 hover:shadow-md transition-all flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-full bg-cream-tint flex items-center justify-center text-bhagva group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="font-semibold text-ink text-sm">My Earnings</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
