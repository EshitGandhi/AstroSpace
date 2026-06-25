"use client";

import { useState } from "react";
import Script from "next/script";
import toast from "react-hot-toast";
import AnimatedButton from "@/components/ui/AnimatedButton";
import GlassCard from "@/components/ui/GlassCard";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type PaymentCheckoutProps = {
  bookingId: string;
  amount: number;
  astrologerName: string;
  onSuccess: () => void;
};

export default function PaymentCheckout({
  bookingId,
  amount,
  astrologerName,
  onSuccess,
}: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const handlePay = async () => {
    if (!keyId) {
      toast.error("Payments are not configured. Contact support to confirm your booking.");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount }),
      });

      if (!orderRes.ok) throw new Error("Order creation failed");
      const { orderId, amount: orderAmount, currency } = await orderRes.json();

      const options = {
        key: keyId,
        amount: orderAmount,
        currency,
        name: "AstroGuru",
        description: `Consultation with ${astrologerName}`,
        order_id: orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              ...response,
            }),
          });
          if (verifyRes.ok) {
            toast.success("Payment successful!");
            onSuccess();
          } else {
            toast.error("Payment verification failed.");
          }
        },
        theme: { color: "#E8590C" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Payment could not be initiated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <GlassCard className="bg-white text-center space-y-6">
        <h2 className="text-xl font-heading font-bold">Complete Payment</h2>
        <p className="text-ink-muted">
          Consultation with <strong>{astrologerName}</strong>
        </p>
        <p className="text-3xl font-bold text-bhagva">₹{amount}</p>
        <AnimatedButton onClick={handlePay} disabled={loading} className="w-full">
          {loading ? "Processing..." : keyId ? "Pay with Razorpay" : "Payments Unavailable"}
        </AnimatedButton>
        {!keyId && (
          <p className="text-xs text-ink-muted">
            Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments.
          </p>
        )}
      </GlassCard>
    </>
  );
}
