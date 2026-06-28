import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, ShieldCheck, Languages, Award, Clock, MessageCircle, Phone, Video } from "lucide-react";
import ClientActions from "./ClientActions";

export default async function PanditProfilePage({ params }: { params: { panditId: string } }) {
  const pandit = await prisma.astrologerProfile.findUnique({
    where: { id: params.panditId },
    include: { user: true }
  });

  if (!pandit) {
    notFound();
  }

  const isVerified = pandit.verificationStatus === "APPROVED";
  const displayRating = pandit.ratingAverage ? pandit.ratingAverage.toFixed(1) : "New";

  return (
    <div className="flex flex-col w-full pb-24 md:pb-0">
      <main className="flex-1 w-full relative">
        {/* Cover / Header */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-bhagva to-orange-600 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-24 md:-mt-32 z-10 pb-12">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-ink/5">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-cream-tint flex-shrink-0 relative">
                {pandit.profileImage ? (
                  <Image src={pandit.profileImage} alt={pandit.displayName || ""} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-bhagva">
                    {(pandit.displayName || "P")[0]}
                  </div>
                )}
                {pandit.isOnline && (
                  <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 pt-2 w-full">
                <h1 className="text-3xl md:text-4xl font-black font-heading text-ink flex items-center justify-center md:justify-start gap-2">
                  {pandit.displayName || "Pandit Ji"}
                  {isVerified && <ShieldCheck className="w-6 h-6 text-green-500" title="Verified" />}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {displayRating} <span className="text-yellow-700/60 ml-1">({pandit.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-ink/5 text-ink px-3 py-1 rounded-full text-sm font-semibold">
                    <Clock className="w-4 h-4 text-ink/60" />
                    {pandit.experience || 0} Years Exp.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex gap-3 text-sm text-ink/80 text-left">
                    <Award className="w-5 h-5 text-bhagva flex-shrink-0" />
                    <div>
                      <span className="font-bold text-ink block mb-1">Expertise</span>
                      {pandit.expertise?.map(e => e.replace(/_/g, " ")).join(", ") || "General Astrology"}
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm text-ink/80 text-left">
                    <Languages className="w-5 h-5 text-bhagva flex-shrink-0" />
                    <div>
                      <span className="font-bold text-ink block mb-1">Languages</span>
                      {pandit.languages?.map(l => l.replace(/_/g, " ")).join(", ") || "Hindi, English"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About & Stats */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-ink/5">
                <h2 className="text-xl font-bold font-heading text-ink mb-4">About Me</h2>
                <div className="text-ink/80 leading-relaxed whitespace-pre-wrap">
                  {pandit.bio || "No biography available for this expert yet."}
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-ink/5">
                <h2 className="text-xl font-bold font-heading text-ink mb-4">Consultation Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-cream-tint rounded-2xl">
                    <div className="text-2xl font-black text-bhagva">{pandit.totalReviews || 0}</div>
                    <div className="text-xs font-bold text-ink/60 mt-1 uppercase">Consults</div>
                  </div>
                  <div className="p-4 bg-cream-tint rounded-2xl">
                    <div className="text-xl font-black text-bhagva">{pandit.isOnline ? "Online" : "Offline"}</div>
                    <div className="text-xs font-bold text-ink/60 mt-1 uppercase">Status</div>
                  </div>
                  <div className="p-4 bg-cream-tint rounded-2xl">
                    <div className="text-2xl font-black text-bhagva">~2m</div>
                    <div className="text-xs font-bold text-ink/60 mt-1 uppercase">Response</div>
                  </div>
                  <div className="p-4 bg-cream-tint rounded-2xl">
                    <div className="text-2xl font-black text-bhagva">{new Date(pandit.createdAt).getFullYear()}</div>
                    <div className="text-xs font-bold text-ink/60 mt-1 uppercase">Joined</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink/5 lg:sticky top-24">
                <h3 className="font-bold font-heading text-lg mb-4">Consultation Fees</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ink/5">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <MessageCircle className="w-5 h-5 text-bhagva" /> Chat
                    </div>
                    <div className="font-bold text-bhagva">₹{pandit.chatPrice || 0}/min</div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ink/5">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <Phone className="w-5 h-5 text-bhagva" /> Voice Call
                    </div>
                    <div className="font-bold text-bhagva">₹{pandit.callPrice || 0}/min</div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-ink/5">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <Video className="w-5 h-5 text-bhagva" /> Video Call
                    </div>
                    <div className="font-bold text-bhagva">₹{pandit.videoCallPrice || 0}/min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <ClientActions pandit={pandit} />
      </main>
    </div>
  );
}
