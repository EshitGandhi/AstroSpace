import { StreamChat } from "stream-chat";

export function getStreamServerClient(): StreamChat | null {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) return null;
  return StreamChat.getInstance(apiKey, apiSecret);
}

export async function ensureStreamChannel(params: {
  consultationId: string;
  userId: string;
  panditUserId: string;
  userName: string;
  panditName: string;
}): Promise<string | null> {
  const client = getStreamServerClient();
  if (!client) return null;

  const channelId = `consultation_${params.consultationId}`;

  await client.upsertUsers([
    { id: params.userId, name: params.userName },
    { id: params.panditUserId, name: params.panditName },
  ]);

  const channel = client.channel("messaging", channelId, {
    members: Array.from(new Set([params.userId, params.panditUserId])),
    created_by_id: params.panditUserId,
  });

  await channel.create();
  try {
    await channel.updatePartial({ set: { name: `${params.userName} ↔ ${params.panditName}` } as any });
  } catch {
    // name update is optional
  }

  return channelId;
}

export function createStreamUserToken(userId: string): string | null {
  const client = getStreamServerClient();
  if (!client) return null;
  return client.createToken(userId);
}

export function getStreamCallId(consultationId: string, mode: "VOICE" | "VIDEO"): string {
  return `${mode.toLowerCase()}_${consultationId}`;
}
