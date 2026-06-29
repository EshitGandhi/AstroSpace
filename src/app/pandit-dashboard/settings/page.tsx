import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GlassCard from "@/components/ui/GlassCard";
import { Settings, Info, Bell, Lock, Globe } from "lucide-react";

export default async function AstrologerSettingsPage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink flex items-center gap-3">
          <Settings className="w-8 h-8 text-bhagva" />
          Settings
        </h1>
        <p className="text-ink-muted mt-2">
          Manage your account preferences, notifications, and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation Sidebar placeholder */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-white shadow-sm border border-bhagva/20 text-bhagva font-bold flex items-center gap-3">
            <Settings className="w-5 h-5" /> General
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 text-ink/70 font-medium flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed">
            <Lock className="w-5 h-5" /> Security
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 text-ink/70 font-medium flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed">
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 text-ink/70 font-medium flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed">
            <Globe className="w-5 h-5" /> Preferences
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 md:p-12 text-center border-dashed border-2 border-ink/20">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-6">
                <Settings className="w-10 h-10 text-bhagva opacity-50 animate-[spin_4s_linear_infinite]" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-3 font-heading">
                Settings Panel Under Construction
              </h2>
              <p className="text-ink-muted mb-8 leading-relaxed">
                We are actively building the settings module where you'll be able to update your password, manage email notifications, and customize your dashboard preferences.
              </p>
              <div className="flex items-center gap-2 text-sm text-bhagva bg-cream-tint px-4 py-2 rounded-lg font-medium">
                <Info className="w-4 h-4" />
                <p>Advanced settings will be rolled out soon.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
