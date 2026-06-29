import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    }

    const { amount } = await req.json();
    if (!amount || amount < 1 || amount > 10000) {
      return NextResponse.json({ error: "Amount must be between ₹1 and ₹10,000" }, { status: 400 });
    }

    const receipt = `wallet_${session.user.id}_${Date.now()}`;
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        notes: { userId: session.user.id, type: "wallet_recharge" },
      }),
    });

    if (!orderRes.ok) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 502 });
    }

    const order = await orderRes.json();
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("Wallet recharge order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
