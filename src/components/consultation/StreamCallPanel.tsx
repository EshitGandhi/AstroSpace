"use client";

import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
  ParticipantView,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  CancelCallButton,
  ReactionsButton,
  useCall,
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

function CallUI({
  otherName,
  otherImage,
  isVoiceCall,
}: {
  otherName?: string;
  otherImage?: string;
  isVoiceCall: boolean;
}) {
  const { useCallCallingState, useParticipants, useLocalParticipant } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const call = useCall();

  if (callingState !== "joined") {
    return (
      <div className="text-center h-full flex flex-col items-center justify-center">
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

  const otherParticipant = participants.find((p) => p.sessionId !== localParticipant?.sessionId);

  return (
    <div className="w-full h-full max-h-[80vh] flex flex-col relative rounded-2xl overflow-hidden bg-black shadow-2xl">
      {/* Main View: Other Person */}
      <div className="flex-1 w-full h-full">
        {otherParticipant ? (
          <ParticipantView participant={otherParticipant} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-4">
            <User className="w-16 h-16 opacity-50" />
            <p>Waiting for other person to join...</p>
          </div>
        )}
      </div>

      {/* Floating View: Self (Min View, Left Side) */}
      {localParticipant && (
        <div className="absolute bottom-24 left-4 w-28 sm:w-36 md:w-48 aspect-[3/4] md:aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-900 z-10">
          <ParticipantView participant={localParticipant} />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
        <div className="str-video__call-controls">
          <ToggleAudioPublishingButton />
          {!isVoiceCall && <ToggleVideoPublishingButton />}
          {!isVoiceCall && <ScreenShareButton />}
          <ReactionsButton />
          <CancelCallButton onLeave={() => call?.leave()} />
        </div>
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

  const isVoiceCall = mode === "VOICE";

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

        // For voice calls: join with camera disabled and screen share off
        await c.join({
          create: true,
        });

        // Immediately disable camera for voice calls
        if (isVoiceCall) {
          await c.camera.disable();
        }

        setCall(c);

        if (isPandit && onPanditJoined) {
          onPanditJoined();
        }
      } catch (err: any) {
        console.error("Join call error:", err);
        setError(err?.message || "Failed to join call.");
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
    <div className="flex-1 flex flex-col p-2 md:p-6 w-full h-full min-h-0">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <div className="str-video str-video__theme-light w-full h-full flex flex-col">
            <StreamTheme className="flex-1 flex flex-col h-full min-h-0">
              <CallUI otherName={otherName} otherImage={otherImage} isVoiceCall={isVoiceCall} />
            </StreamTheme>
          </div>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
