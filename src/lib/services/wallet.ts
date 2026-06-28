import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

const MIN_BALANCE_PAISA = 5000; // ₹50

/**
 * Get user wallet balance in paisa.
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });
  return user?.walletBalance ?? 0;
}

/**
 * Credit wallet (admin/recharge). Returns new balance.
 */
export async function creditWallet(
  userId: string,
  amountPaisa: number,
  description: string,
  type: TransactionType = "RECHARGE",
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): Promise<number> {
  if (amountPaisa <= 0) throw new Error("Amount must be positive");

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore + amountPaisa;

    await tx.walletTransaction.create({
      data: {
        userId,
        type,
        amount: amountPaisa,
        balanceBefore,
        balanceAfter,
        description,
        razorpayOrderId,
        razorpayPaymentId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: balanceAfter },
    });

    return balanceAfter;
  });

  return result;
}

/**
 * Lock wallet balance for a consultation. Returns locked amount.
 */
export async function lockBalance(
  userId: string,
  consultationId: string,
  amountPaisa: number
): Promise<number> {
  if (amountPaisa <= 0) throw new Error("Lock amount must be positive");

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.walletBalance < amountPaisa) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore - amountPaisa;

    await tx.walletTransaction.create({
      data: {
        userId,
        consultationId,
        type: "CONSULTATION_LOCK",
        amount: -amountPaisa,
        balanceBefore,
        balanceAfter,
        description: "Balance locked for consultation",
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: balanceAfter },
    });

    return amountPaisa;
  });

  return result;
}

/**
 * Deduct one minute's charge during an active session.
 * Returns { success, remainingBalance, canContinue }.
 */
export async function deductMinute(
  userId: string,
  consultationId: string,
  pricePerMinutePaisa: number
): Promise<{ success: boolean; remainingBalance: number; canContinue: boolean }> {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const balanceBefore = user.walletBalance;

    // If user can't afford this minute, signal can't continue
    if (balanceBefore < pricePerMinutePaisa) {
      return { success: false, remainingBalance: balanceBefore, canContinue: false };
    }

    const balanceAfter = balanceBefore - pricePerMinutePaisa;

    await tx.walletTransaction.create({
      data: {
        userId,
        consultationId,
        type: "CONSULTATION_DEBIT",
        amount: -pricePerMinutePaisa,
        balanceBefore,
        balanceAfter,
        description: `Minute charge`,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: balanceAfter },
    });

    // Can the user afford the NEXT minute?
    const canContinue = balanceAfter >= pricePerMinutePaisa;

    return { success: true, remainingBalance: balanceAfter, canContinue };
  });

  return result;
}

/**
 * Refund locked/unused balance back to user.
 */
export async function refundBalance(
  userId: string,
  consultationId: string,
  amountPaisa: number,
  description: string = "Consultation refund"
): Promise<number> {
  if (amountPaisa <= 0) return 0;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore + amountPaisa;

    await tx.walletTransaction.create({
      data: {
        userId,
        consultationId,
        type: "CONSULTATION_REFUND",
        amount: amountPaisa,
        balanceBefore,
        balanceAfter,
        description,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: balanceAfter },
    });

    return balanceAfter;
  });

  return result;
}

/**
 * Credit pandit after session ends.
 */
export async function creditPandit(
  panditUserId: string,
  consultationId: string,
  amountPaisa: number
): Promise<number> {
  if (amountPaisa <= 0) return 0;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: panditUserId } });
    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore + amountPaisa;

    await tx.walletTransaction.create({
      data: {
        userId: panditUserId,
        consultationId,
        type: "PANDIT_CREDIT",
        amount: amountPaisa,
        balanceBefore,
        balanceAfter,
        description: `Earnings from consultation`,
      },
    });

    await tx.user.update({
      where: { id: panditUserId },
      data: { walletBalance: balanceAfter },
    });

    return balanceAfter;
  });

  return result;
}

/**
 * Check if user has enough balance to start a consultation.
 */
export function hasMinimumBalance(balancePaisa: number): boolean {
  return balancePaisa >= MIN_BALANCE_PAISA;
}

/**
 * Get transaction history for a user.
 */
export async function getTransactions(userId: string, limit = 50) {
  return prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
