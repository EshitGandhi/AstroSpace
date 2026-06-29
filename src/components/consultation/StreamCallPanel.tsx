"use client";

import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { StreamVideoClient } from "@stream-io/video-client";
import { Loader2, User, Mic, MicOff, PhoneOff } from "lucide-react";
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

/** Audio-only controls: mic toggle + hang up. No camera or screen share. */
function VoiceCallControls() {
  const call = useCall();
  const { useMicrophoneState } = useCallStateHooks();
  const { isMute } = useMicrophoneState();

  const toggleMic = async () => {
    await call?.microphone.toggle();
  };

  const leaveCall = async () => {
    await call?.leave();
  };

  return (
    <div className="flex items-center gap-6 mt-8">
      <button
        onClick={toggleMic}
        title={isMute ? "Unmute" : "Mute"}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
          isMute
            ? "bg-red-500 text-white"
            : "bg-white/90 text-bhagva border border-bhagva/20"
        }`}
      >
        {isMute ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      <button
        onClick={leaveCall}
        title="End call"
        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <PhoneOff className="w-7 h-7" />
      </button>
    </div>
  );
}

/** Voice call UI — no video tiles, just an avatar + audio controls */
function VoiceCallUI({
  otherName,
  otherImage,
}: {
  otherName?: string;
  otherImage?: string;
}) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  if (callingState !== "joined") {
    return (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 bg-cream-tint rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
          {otherImage ? (
            <img src={otherImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-bhagva/50" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-ink mb-1">
          {otherName || "Connecting..."}
        </h3>
        <Loader2 className="w-6 h-6 animate-spin text-bhagva mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Avatar */}
      <div className="relative w-36 h-36 rounded-full flex items-center justify-center mb-6 shadow-2xl overflow-hidden ring-4 ring-bhagva/30">
        {otherImage ? (
          <img src={otherImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bhagva/20 to-bhagva/40 flex items-center justify-center">
            <User className="w-20 h-20 text-bhagva/70" />
          </div>
        )}
        {/* Animated ring when connected */}
        <span className="absolute inset-0 rounded-full animate-ping ring-2 ring-bhagva/20 opacity-50" />
      </div>

      <h3 className="text-2xl font-bold text-ink mb-1">{otherName || "Connected"}</h3>
      <p className="text-sm text-ink/50 mb-2">
        {participantCount > 1 ? "🟢 On call" : "⏳ Waiting for other party..."}
      </p>
      <p className="text-xs text-bhagva/70 font-medium tracking-wide uppercase">
        Voice Call
      </p>

      <VoiceCallControls />
    </div>
  );
}

/** Standard video call UI with full controls */
function VideoCallUI({
  otherName,
  otherImage,
}: {
  otherName?: string;
  otherImage?: string;
}) {
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
          ...(isVoiceCall && {
            data: {
              settings_override: {
                video: { enabled: false, access_request_enabled: false },
                screensharing: { enabled: false, access_request_enabled: false },
              },
            },
          }),
        });

        // Immediately disable camera for voice calls
        if (isVoiceCall) {
          await c.camera.disable();
        }

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
            {isVoiceCall ? (
              <VoiceCallUI otherName={otherName} otherImage={otherImage} />
            ) : (
              <VideoCallUI otherName={otherName} otherImage={otherImage} />
            )}
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
