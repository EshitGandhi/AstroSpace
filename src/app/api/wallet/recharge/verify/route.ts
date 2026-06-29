import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/session";
import { creditWallet } from "@/lib/services/wallet";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const amountPaisa = Math.round(Number(amount) * 100);
    const newBalance = await creditWallet(
      session.user.id,
      amountPaisa,
      `Wallet recharge of ₹${amount}`,
      "RECHARGE",
      razorpay_order_id,
      razorpay_payment_id
    );

    return NextResponse.json({ success: true, balance: newBalance, balanceRupees: newBalance / 100 });
  } catch (err) {
    console.error("Wallet recharge verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
