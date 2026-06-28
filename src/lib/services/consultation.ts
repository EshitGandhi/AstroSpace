import { prisma } from "@/lib/prisma";
import { ConsultMode } from "@prisma/client";
import { lockBalance, refundBalance, creditPandit, deductMinute } from "./wallet";
import { createNotification } from "./notification";

const INSTANT_EXPIRY_MS = 3 * 60 * 1000;
const SCHEDULED_EXPIRY_MS = 24 * 60 * 60 * 1000;
const JOIN_WINDOW_MS = 3 * 60 * 1000;
const MIN_BALANCE_PAISA = 5000;

/**
 * Create a new consultation request.
 */
export async function createConsultationRequest(params: {
  userId: string;
  panditId: string;
  mode: ConsultMode;
  isInstant: boolean;
  scheduledTime?: Date;
  description?: string;
}) {
  const { userId, panditId, mode, isInstant, scheduledTime, description } = params;

  const activeUserConsult = await prisma.consultation.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "ACCEPTED", "WAITING", "ONGOING"] },
    },
  });
  if (activeUserConsult) {
    throw new Error("USER_HAS_ACTIVE_CONSULTATION");
  }

  const activePanditConsult = await prisma.consultation.findFirst({
    where: {
      panditId,
      status: { in: ["ONGOING"] },
    },
  });
  if (activePanditConsult) {
    throw new Error("PANDIT_BUSY");
  }

  const pandit = await prisma.astrologerProfile.findUnique({
    where: { id: panditId },
    include: { user: true },
  });
  if (!pandit) throw new Error("PANDIT_NOT_FOUND");

  if (isInstant && !pandit.isOnline) {
    throw new Error("PANDIT_OFFLINE");
  }

  let pricePerMinute = 0;
  switch (mode) {
    case "CHAT": pricePerMinute = (pandit.chatPrice || 15) * 100; break;
    case "VOICE": pricePerMinute = (pandit.callPrice || 25) * 100; break;
    case "VIDEO": pricePerMinute = (pandit.videoCallPrice || 35) * 100; break;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.walletBalance < MIN_BALANCE_PAISA) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  const expiresAt = new Date(
    Date.now() + (isInstant ? INSTANT_EXPIRY_MS : SCHEDULED_EXPIRY_MS)
  );

  const lockAmount = Math.min(user.walletBalance, pricePerMinute * 5);

  const consultation = await prisma.consultation.create({
    data: {
      userId,
      panditId,
      mode,
      isInstant,
      scheduledTime: isInstant ? null : scheduledTime,
      description,
      pricePerMinute,
      lockedAmount: lockAmount,
      expiresAt,
    },
  });

  await lockBalance(userId, consultation.id, lockAmount);

  await prisma.consultEvent.create({
    data: {
      consultationId: consultation.id,
      eventType: "REQUEST_CREATED",
      metadata: { mode, isInstant, pricePerMinute },
    },
  });

  await createNotification({
    userId: pandit.userId,
    title: "New Consultation Request",
    body: `${user.name} wants to ${mode.toLowerCase()} with you.`,
    type: "NEW_REQUEST",
    metadata: { consultationId: consultation.id, mode },
  });

  return consultation;
}

/**
 * Pandit accepts a consultation request.
 */
export async function acceptConsultation(consultationId: string, panditUserId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true, user: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.pandit.userId !== panditUserId) throw new Error("UNAUTHORIZED");
  if (consultation.status !== "PENDING") throw new Error("INVALID_STATUS");

  if (consultation.expiresAt && new Date() > consultation.expiresAt) {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: "EXPIRED" },
    });
    await refundBalance(consultation.userId, consultationId, consultation.lockedAmount, "Request expired — refund");
    throw new Error("REQUEST_EXPIRED");
  }

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      status: "WAITING",
      joinExpiresAt: new Date(Date.now() + JOIN_WINDOW_MS),
    },
  });

  await prisma.consultEvent.create({
    data: { consultationId, eventType: "ACCEPTED" },
  });

  await createNotification({
    userId: consultation.userId,
    title: "Consultation Accepted!",
    body: `${consultation.pandit.displayName || "Your pandit"} accepted your request. Join within 3 minutes!`,
    type: "ACCEPTED",
    metadata: { consultationId, mode: consultation.mode },
  });

  return updated;
}

/**
 * Pandit rejects a consultation request.
 */
export async function rejectConsultation(consultationId: string, panditUserId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.pandit.userId !== panditUserId) throw new Error("UNAUTHORIZED");
  if (consultation.status !== "PENDING") throw new Error("INVALID_STATUS");

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: "REJECTED" },
  });

  await refundBalance(consultation.userId, consultationId, consultation.lockedAmount, "Request rejected — refund");

  await prisma.consultEvent.create({
    data: { consultationId, eventType: "REJECTED" },
  });

  await createNotification({
    userId: consultation.userId,
    title: "Request Declined",
    body: "Your consultation request was declined. Your wallet has been refunded.",
    type: "REJECTED",
    metadata: { consultationId },
  });

  return updated;
}

/**
 * Charge one minute and credit pandit (used at billing start and each tick).
 */
async function chargeMinute(consultationId: string, panditUserId: string, pricePerMinute: number, userId: string) {
  const result = await deductMinute(userId, consultationId, pricePerMinute);
  if (!result.success) {
    return { success: false as const, remainingBalance: result.remainingBalance };
  }

  await creditPandit(panditUserId, consultationId, pricePerMinute);

  await prisma.consultation.update({
    where: { id: consultationId },
    data: { totalMinutes: { increment: 1 }, totalCost: { increment: pricePerMinute } },
  });

  return { success: true as const, canContinue: result.canContinue, remainingBalance: result.remainingBalance };
}

/**
 * Start billing when pandit sends first chat message or joins voice/video.
 */
export async function startSession(consultationId: string, panditUserId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.pandit.userId !== panditUserId) throw new Error("UNAUTHORIZED");
  if (consultation.status !== "WAITING" && consultation.status !== "ACCEPTED") {
    throw new Error("INVALID_STATUS");
  }

  if (consultation.joinExpiresAt && new Date() > consultation.joinExpiresAt) {
    throw new Error("JOIN_WINDOW_EXPIRED");
  }

  const now = new Date();
  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: "ONGOING", startedAt: now, billingStartedAt: now },
  });

  await prisma.consultEvent.create({
    data: { consultationId, eventType: "SESSION_STARTED", metadata: { mode: consultation.mode } },
  });

  const charge = await chargeMinute(
    consultationId,
    consultation.pandit.userId,
    consultation.pricePerMinute,
    consultation.userId
  );

  if (!charge.success) {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: "COMPLETED", endedAt: now },
    });
    await releaseLockedBalance(consultationId);
    throw new Error("INSUFFICIENT_BALANCE");
  }

  return updated;
}

/**
 * Refund escrowed lock after session ends or is cancelled.
 */
export async function releaseLockedBalance(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation || consultation.lockedAmount <= 0) return;

  await refundBalance(
    consultation.userId,
    consultationId,
    consultation.lockedAmount,
    "Consultation lock released"
  );

  await prisma.consultation.update({
    where: { id: consultationId },
    data: { lockedAmount: 0 },
  });
}

/**
 * Start billing when pandit begins typing in chat (first keystroke).
 */
export async function startSessionOnTyping(consultationId: string, panditUserId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.pandit.userId !== panditUserId) throw new Error("UNAUTHORIZED");
  if (consultation.mode !== "CHAT") throw new Error("INVALID_MODE");
  if (consultation.status === "ONGOING") throw new Error("ALREADY_STARTED");
  if (consultation.status !== "WAITING" && consultation.status !== "ACCEPTED") {
    throw new Error("INVALID_STATUS");
  }

  const updated = await startSession(consultationId, panditUserId);
  return { started: true, consultation: updated };
}

/**
 * Send a chat message (billing is triggered separately via typing).
 */
export async function sendChatMessage(consultationId: string, senderUserId: string, messageText: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.userId !== senderUserId && consultation.pandit.userId !== senderUserId) {
    throw new Error("UNAUTHORIZED");
  }
  if (!["WAITING", "ACCEPTED", "ONGOING"].includes(consultation.status)) {
    throw new Error("INVALID_STATUS");
  }

  const message = await prisma.consultMessage.create({
    data: {
      consultationId,
      senderId: senderUserId,
      messageText,
    },
  });

  return message;
}

/**
 * Pandit joins voice/video call — starts billing.
 */
export async function joinCallSession(consultationId: string, panditUserId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.pandit.userId !== panditUserId) throw new Error("UNAUTHORIZED");
  if (consultation.mode === "CHAT") throw new Error("INVALID_MODE");

  if (consultation.status === "ONGOING") {
    return consultation;
  }

  return startSession(consultationId, panditUserId);
}

/**
 * End an active session.
 */
export async function endSession(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.status !== "ONGOING") throw new Error("INVALID_STATUS");

  const endedAt = new Date();

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      status: "COMPLETED",
      endedAt,
    },
  });

  await releaseLockedBalance(consultationId);

  await prisma.consultEvent.create({
    data: {
      consultationId,
      eventType: "SESSION_ENDED",
      metadata: {
        totalMinutes: consultation.totalMinutes,
        totalCost: consultation.totalCost,
      },
    },
  });

  await createNotification({
    userId: consultation.userId,
    title: "Session Completed",
    body: `Your ${consultation.mode.toLowerCase()} session lasted ${consultation.totalMinutes} min. Total: ₹${(consultation.totalCost / 100).toFixed(0)}`,
    type: "SESSION_ENDED",
    metadata: { consultationId, totalMinutes: consultation.totalMinutes, totalCost: consultation.totalCost },
  });

  await createNotification({
    userId: consultation.pandit.userId,
    title: "Session Completed",
    body: `Session earned: ₹${(consultation.totalCost / 100).toFixed(0)} (${consultation.totalMinutes} min)`,
    type: "SESSION_ENDED",
    metadata: { consultationId, totalMinutes: consultation.totalMinutes, totalCost: consultation.totalCost },
  });

  return updated;
}

/**
 * Process a billing tick (called every minute during active session).
 */
export async function processBillingTick(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation || consultation.status !== "ONGOING") {
    return { shouldEnd: true, reason: "NOT_ACTIVE" };
  }

  const charge = await chargeMinute(
    consultationId,
    consultation.pandit.userId,
    consultation.pricePerMinute,
    consultation.userId
  );

  if (!charge.success) {
    return { shouldEnd: true, reason: "INSUFFICIENT_BALANCE", remainingBalance: charge.remainingBalance };
  }

  if (!charge.canContinue) {
    await createNotification({
      userId: consultation.userId,
      title: "⚠️ Low Balance",
      body: "Your wallet balance is low. The session will end soon unless you recharge.",
      type: "LOW_BALANCE",
      metadata: { consultationId, remainingBalance: charge.remainingBalance },
    });

    return { shouldEnd: false, lowBalance: true, remainingBalance: charge.remainingBalance };
  }

  return { shouldEnd: false, lowBalance: false, remainingBalance: charge.remainingBalance };
}

/**
 * Expire stale pending requests and missed join windows.
 */
export async function expireStaleConsultations() {
  const now = new Date();
  let count = 0;

  const stalePending = await prisma.consultation.findMany({
    where: { status: "PENDING", expiresAt: { lt: now } },
  });

  for (const c of stalePending) {
    await prisma.consultation.update({ where: { id: c.id }, data: { status: "EXPIRED" } });
    await refundBalance(c.userId, c.id, c.lockedAmount, "Request expired — auto-refund");
    await createNotification({
      userId: c.userId,
      title: "Request Expired",
      body: "Your consultation request expired. Your wallet has been refunded.",
      type: "EXPIRED",
      metadata: { consultationId: c.id },
    });
    count++;
  }

  const missedJoins = await prisma.consultation.findMany({
    where: {
      status: { in: ["WAITING", "ACCEPTED"] },
      joinExpiresAt: { lt: now },
    },
  });

  for (const c of missedJoins) {
    await prisma.consultation.update({ where: { id: c.id }, data: { status: "MISSED", endedAt: now } });
    await refundBalance(c.userId, c.id, c.lockedAmount, "Join window expired — refund");
    await createNotification({
      userId: c.userId,
      title: "Session Missed",
      body: "You did not join within 3 minutes. Your wallet has been refunded.",
      type: "MISSED",
      metadata: { consultationId: c.id },
    });
    count++;
  }

  return count;
}

/** @deprecated Use expireStaleConsultations */
export async function expireStalePendingRequests() {
  return expireStaleConsultations();
}
