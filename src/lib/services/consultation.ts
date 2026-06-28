import { prisma } from "@/lib/prisma";
import { ConsultMode, ConsultStatus } from "@prisma/client";
import { lockBalance, refundBalance, creditPandit, deductMinute } from "./wallet";
import { createNotification } from "./notification";

const INSTANT_EXPIRY_MS = 3 * 60 * 1000;   // 3 minutes
const SCHEDULED_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_BALANCE_PAISA = 5000; // ₹50

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

  // Prevent duplicate active consultations for same user
  const activeUserConsult = await prisma.consultation.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "ACCEPTED", "WAITING", "ONGOING"] },
    },
  });
  if (activeUserConsult) {
    throw new Error("USER_HAS_ACTIVE_CONSULTATION");
  }

  // Prevent duplicate active consultations for same pandit
  const activePanditConsult = await prisma.consultation.findFirst({
    where: {
      panditId,
      status: { in: ["ONGOING"] },
    },
  });
  if (activePanditConsult) {
    throw new Error("PANDIT_BUSY");
  }

  // Get pandit profile for pricing
  const pandit = await prisma.astrologerProfile.findUnique({
    where: { id: panditId },
    include: { user: true },
  });
  if (!pandit) throw new Error("PANDIT_NOT_FOUND");

  // Check pandit is online for instant consultations
  if (isInstant && !pandit.isOnline) {
    throw new Error("PANDIT_OFFLINE");
  }

  // Determine price per minute based on mode
  let pricePerMinute = 0;
  switch (mode) {
    case "CHAT": pricePerMinute = (pandit.chatPrice || 15) * 100; break;
    case "VOICE": pricePerMinute = (pandit.callPrice || 25) * 100; break;
    case "VIDEO": pricePerMinute = (pandit.videoCallPrice || 35) * 100; break;
  }

  // Check user wallet balance
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.walletBalance < MIN_BALANCE_PAISA) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  // Calculate expiry
  const expiresAt = new Date(
    Date.now() + (isInstant ? INSTANT_EXPIRY_MS : SCHEDULED_EXPIRY_MS)
  );

  // Lock minimum balance
  const lockAmount = Math.min(user.walletBalance, pricePerMinute * 5); // Lock up to 5 minutes
  
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

  // Lock wallet balance
  await lockBalance(userId, consultation.id, lockAmount);

  // Create audit event
  await prisma.consultEvent.create({
    data: {
      consultationId: consultation.id,
      eventType: "REQUEST_CREATED",
      metadata: { mode, isInstant, pricePerMinute },
    },
  });

  // Notify pandit
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

  // Check expiry
  if (consultation.expiresAt && new Date() > consultation.expiresAt) {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: "EXPIRED" },
    });
    // Refund locked amount
    await refundBalance(consultation.userId, consultationId, consultation.lockedAmount, "Request expired — refund");
    throw new Error("REQUEST_EXPIRED");
  }

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: "ACCEPTED" },
  });

  await prisma.consultEvent.create({
    data: {
      consultationId,
      eventType: "ACCEPTED",
    },
  });

  // Notify user
  await createNotification({
    userId: consultation.userId,
    title: "Consultation Accepted!",
    body: `${consultation.pandit.displayName || "Your pandit"} accepted your request. Join now!`,
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

  // Refund locked amount
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
 * Start the session timer (when first message is sent or both join a call).
 */
export async function startSession(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.status !== "ACCEPTED" && consultation.status !== "WAITING") {
    throw new Error("INVALID_STATUS");
  }

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: "ONGOING", startedAt: new Date() },
  });

  await prisma.consultEvent.create({
    data: { consultationId, eventType: "SESSION_STARTED" },
  });

  return updated;
}

/**
 * End an active session. Calculate total billing and credit pandit.
 */
export async function endSession(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { pandit: true },
  });

  if (!consultation) throw new Error("NOT_FOUND");
  if (consultation.status !== "ONGOING") throw new Error("INVALID_STATUS");

  const endedAt = new Date();
  const startedAt = consultation.startedAt || endedAt;
  const durationMs = endedAt.getTime() - startedAt.getTime();
  const totalMinutes = Math.max(1, Math.ceil(durationMs / 60000));
  const totalCost = totalMinutes * consultation.pricePerMinute;

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      status: "COMPLETED",
      endedAt,
      totalMinutes,
      totalCost,
    },
  });

  // Credit pandit earnings
  await creditPandit(consultation.pandit.userId, consultationId, totalCost);

  await prisma.consultEvent.create({
    data: {
      consultationId,
      eventType: "SESSION_ENDED",
      metadata: { totalMinutes, totalCost, durationMs },
    },
  });

  // Notify both parties
  await createNotification({
    userId: consultation.userId,
    title: "Session Completed",
    body: `Your ${consultation.mode.toLowerCase()} session lasted ${totalMinutes} min. Total: ₹${(totalCost / 100).toFixed(0)}`,
    type: "SESSION_ENDED",
    metadata: { consultationId, totalMinutes, totalCost },
  });

  await createNotification({
    userId: consultation.pandit.userId,
    title: "Session Completed",
    body: `Session with user lasted ${totalMinutes} min. Earned: ₹${(totalCost / 100).toFixed(0)}`,
    type: "SESSION_ENDED",
    metadata: { consultationId, totalMinutes, totalCost },
  });

  return updated;
}

/**
 * Process a billing tick (called every minute during active session).
 */
export async function processBillingTick(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  if (!consultation || consultation.status !== "ONGOING") {
    return { shouldEnd: true, reason: "NOT_ACTIVE" };
  }

  const result = await deductMinute(
    consultation.userId,
    consultationId,
    consultation.pricePerMinute
  );

  if (!result.success) {
    return { shouldEnd: true, reason: "INSUFFICIENT_BALANCE", remainingBalance: result.remainingBalance };
  }

  // Update total minutes on consultation
  await prisma.consultation.update({
    where: { id: consultationId },
    data: { totalMinutes: { increment: 1 }, totalCost: { increment: consultation.pricePerMinute } },
  });

  if (!result.canContinue) {
    // Warn user about low balance
    await createNotification({
      userId: consultation.userId,
      title: "⚠️ Low Balance",
      body: "Your wallet balance is low. The session will end soon unless you recharge.",
      type: "LOW_BALANCE",
      metadata: { consultationId, remainingBalance: result.remainingBalance },
    });

    return { shouldEnd: false, lowBalance: true, remainingBalance: result.remainingBalance };
  }

  return { shouldEnd: false, lowBalance: false, remainingBalance: result.remainingBalance };
}

/**
 * Expire stale pending requests (called by a cron or on-demand).
 */
export async function expireStalePendingRequests() {
  const now = new Date();

  const staleConsultations = await prisma.consultation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
  });

  for (const c of staleConsultations) {
    await prisma.consultation.update({
      where: { id: c.id },
      data: { status: "EXPIRED" },
    });

    await refundBalance(c.userId, c.id, c.lockedAmount, "Request expired — auto-refund");

    await createNotification({
      userId: c.userId,
      title: "Request Expired",
      body: "Your consultation request expired. Your wallet has been refunded.",
      type: "EXPIRED",
      metadata: { consultationId: c.id },
    });
  }

  return staleConsultations.length;
}
