"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MessageCircle, Calendar, Phone, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PanditCardProps {
  pandit: any;
  rank?: number;
}

export default function PanditCard({ pandit, rank }: PanditCardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleAction = (action: "chat" | "schedule") => {
    if (!session?.user) {
      router.push("/sign-in?callbackUrl=/consult");
      return;
    }
    if (action === "chat") {
      router.push(`/consult/${pandit.id}`);
    } else {
      router.push(`/consult/${pandit.id}?schedule=true`);
    }
  };

  const isVerified = pandit.verificationStatus === "APPROVED";
  const displayRating = pandit.ratingAverage ? pandit.ratingAverage.toFixed(1) : "New";

  return (
    <div className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-ink/5 hover:border-bhagva/30 flex flex-col h-full overflow-hidden">
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none`}>
           <span className="absolute top-2 right-4 text-4xl font-black">#{rank}</span>
        </div>
      )}

      {/* Top Section: Avatar & Basic Info */}
      <div className="flex gap-4 items-start">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-bhagva/20 flex-shrink-0">
          {pandit.profileImage ? (
            <Image src={pandit.profileImage} alt={pandit.displayName || "Pandit"} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full bg-cream-tint flex items-center justify-center text-bhagva text-xl font-bold">
              {(pandit.displayName || "P")[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <Link href={`/consult/${pandit.id}`} className="block group-hover:text-bhagva transition-colors">
            <h3 className="font-bold font-heading text-lg text-ink flex items-center gap-1.5 truncate">
              {pandit.displayName || "Pandit Ji"}
              {isVerified && <span className="flex items-center text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold"><ShieldCheck className="w-3 h-3 mr-0.5" /> Verified</span>}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-1 text-sm font-bold text-ink">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              {displayRating}
            </div>
            <span className="text-xs text-ink/60">({pandit.totalReviews} Reviews)</span>
          </div>

          <div className="mt-1.5">
             {pandit.isOnline ? (
               <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Available Now
               </div>
             ) : (
               <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                 <div className="w-2 h-2 bg-red-500 rounded-full"></div> Offline
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Expertise Badges */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {pandit.expertise?.slice(0, 3).map((e: string, i: number) => (
          <span key={i} className="px-2 py-1 bg-ink/5 rounded-md text-[10px] font-bold text-ink/70 border border-ink/5">
            {e.replace(/_/g, " ")}
          </span>
        ))}
        {pandit.expertise?.length > 3 && (
          <span className="px-2 py-1 bg-ink/5 rounded-md text-[10px] font-bold text-ink/70 border border-ink/5">
            +{pandit.expertise.length - 3}
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-ink/60 line-clamp-1">
        <span className="font-semibold text-ink/80">Languages:</span> {pandit.languages?.map((l: string) => l.replace(/_/g, " ")).join(", ") || "Hindi, English"}
      </div>

      {/* Pricing Strip */}
      <div className="mt-4 grid grid-cols-3 gap-1 p-2 bg-cream-tint rounded-xl border border-bhagva/10">
        <div className="flex flex-col items-center justify-center text-center">
          <MessageCircle className="w-4 h-4 text-bhagva mb-0.5" />
          <span className="text-[10px] text-ink/60 font-bold uppercase">Chat</span>
          <span className="text-xs font-black text-ink">₹{pandit.chatPrice || 15}/m</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center border-l border-ink/10">
          <Phone className="w-4 h-4 text-bhagva mb-0.5" />
          <span className="text-[10px] text-ink/60 font-bold uppercase">Voice</span>
          <span className="text-xs font-black text-ink">₹{pandit.callPrice || 25}/m</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center border-l border-ink/10">
          <Video className="w-4 h-4 text-bhagva mb-0.5" />
          <span className="text-[10px] text-ink/60 font-bold uppercase">Video</span>
          <span className="text-xs font-black text-ink">₹{pandit.videoCallPrice || 35}/m</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
        <button 
          onClick={() => handleAction("chat")}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bhagva text-white text-sm font-bold shadow-sm hover:bg-bhagva/90 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Chat
        </button>
        <button 
          onClick={() => handleAction("schedule")}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border-2 border-bhagva text-bhagva text-sm font-bold hover:bg-bhagva/5 transition-colors"
        >
          <Calendar className="w-4 h-4" /> Schedule
        </button>
      </div>
    </div>
  );
}
