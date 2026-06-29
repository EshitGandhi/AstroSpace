"use client";

import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { StreamVideoClient } from "@stream-io/video-client";
import { Loader2, User } from "lucide-react";
import "@stream-io/video-react-sdk/dist/css/styles.css";

type StreamCallPanelProps = {
  consultationId: string;
  streamCallId: string | null;
  mode: "VOICE" | "VIDEO";
  userId: string;
  userName: string;
  isPandit: boolean;
  onPanditJoined?: () => void;
  otherName?: string;
  otherImage?: string;
};

function CallUI({ otherName, otherImage }: { otherName?: string; otherImage?: string }) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== "joined") {
    return (
      <div className="text-center">
        <div className="w-32 h-32 bg-cream-tint rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
          {otherImage ? (
            <img src={otherImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-bhagva/50" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-ink mb-1">{otherName || "Connecting..."}</h3>
        <Loader2 className="w-6 h-6 animate-spin text-bhagva mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <SpeakerLayout />
      <div className="flex justify-center mt-6">
        <CallControls />
      </div>
    </div>
  );
}

export default function StreamCallPanel({
  consultationId,
  streamCallId,
  mode,
  userId,
  userName,
  isPandit,
  onPanditJoined,
  otherName,
  otherImage,
}: StreamCallPanelProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<StreamVideoClient["call"]> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let videoClient: StreamVideoClient | null = null;

    async function init() {
      try {
        const res = await fetch("/api/stream/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userName }),
        });

        if (!res.ok) {
          setError("Stream video unavailable.");
          return;
        }

        const { token, apiKey } = await res.json();
        videoClient = new StreamVideoClient({ apiKey, user: { id: userId, name: userName }, token });
        setClient(videoClient);

        const callId = streamCallId || `${mode.toLowerCase()}_${consultationId}`;
        const c = videoClient.call("default", callId);
        await c.join({ create: true });
        setCall(c);

        if (isPandit && onPanditJoined) {
          onPanditJoined();
        }
      } catch {
        setError("Failed to join call.");
      }
    }

    init();

    return () => {
      call?.leave().catch(() => undefined);
      videoClient?.disconnectUser().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, streamCallId, mode, userId, userName, isPandit]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink/60">
        <p>{error}</p>
        {isPandit && onPanditJoined && (
          <button
            onClick={onPanditJoined}
            className="mt-4 px-6 py-3 bg-bhagva text-white rounded-xl font-bold"
          >
            Start Session (Fallback)
          </button>
        )}
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme>
            <CallUI otherName={otherName} otherImage={otherImage} />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
