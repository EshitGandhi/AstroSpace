import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getWalletBalance, getTransactions, creditWallet } from "@/lib/services/wallet";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await getWalletBalance(session.user.id);
    return NextResponse.json({ balance, balanceRupees: balance / 100 });
  } catch (err) {
    console.error("Get wallet balance error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Temporary admin credit endpoint for testing (no Razorpay yet).
 * POST /api/wallet/balance { amount: 500 } → credits ₹500 to user wallet.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || amount <= 0 || amount > 10000) {
      return NextResponse.json({ error: "Amount must be between ₹1 and ₹10,000" }, { status: 400 });
    }

    const amountPaisa = Math.round(amount * 100);
    const newBalance = await creditWallet(
      session.user.id,
      amountPaisa,
      `Manual recharge of ₹${amount}`,
      "ADMIN_CREDIT"
    );

    return NextResponse.json({ balance: newBalance, balanceRupees: newBalance / 100 });
  } catch (err) {
    console.error("Credit wallet error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
