import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const profile = await prisma.astrologerProfile.findUnique({
      where: { id },
      select: {
        pricingPackages: true,
        chatPrice: true,
        callPrice: true,
        videoCallPrice: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Guru not found" }, { status: 404 });
    }

    const rawPackages = (profile.pricingPackages as any[]) || [];

    // Map database package structure to expected API format
    const mappedPackages = rawPackages.map((pkg: any) => {
      let mappedType = "CHAT";
      if (pkg.type === "call") mappedType = "VOICE";
      else if (pkg.type === "video") mappedType = "VIDEO";

      return {
        id: pkg.id,
        type: mappedType,
        duration: pkg.duration,
        packagePrice: pkg.price,
      };
    });

    const chatPrice = profile.chatPrice || 15;
    const callPrice = profile.callPrice || 25;
    const videoCallPrice = profile.videoCallPrice || 35;

    const defaultChatPackages = [
      { id: "default_chat_10", type: "CHAT", duration: 10, packagePrice: chatPrice * 10 },
      { id: "default_chat_20", type: "CHAT", duration: 20, packagePrice: chatPrice * 20 },
      { id: "default_chat_30", type: "CHAT", duration: 30, packagePrice: chatPrice * 30 },
    ];

    const defaultVoicePackages = [
      { id: "default_voice_10", type: "VOICE", duration: 10, packagePrice: callPrice * 10 },
      { id: "default_voice_20", type: "VOICE", duration: 20, packagePrice: callPrice * 20 },
      { id: "default_voice_30", type: "VOICE", duration: 30, packagePrice: callPrice * 30 },
    ];

    const defaultVideoPackages = [
      { id: "default_video_10", type: "VIDEO", duration: 10, packagePrice: videoCallPrice * 10 },
      { id: "default_video_20", type: "VIDEO", duration: 20, packagePrice: videoCallPrice * 20 },
      { id: "default_video_30", type: "VIDEO", duration: 30, packagePrice: videoCallPrice * 30 },
    ];

    const finalPackages = [...mappedPackages];

    const hasChat = mappedPackages.some((p) => p.type === "CHAT");
    const hasVoice = mappedPackages.some((p) => p.type === "VOICE");
    const hasVideo = mappedPackages.some((p) => p.type === "VIDEO");

    if (!hasChat) finalPackages.push(...defaultChatPackages);
    if (!hasVoice) finalPackages.push(...defaultVoicePackages);
    if (!hasVideo) finalPackages.push(...defaultVideoPackages);

    return NextResponse.json(finalPackages);
  } catch (err) {
    console.error("[GET_GURU_PACKAGES]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
