"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

const RECHARGE_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

const typeLabels: Record<string, { label: string; color: string }> = {
  RECHARGE: { label: "Recharge", color: "text-green-600 bg-green-50" },
  ADMIN_CREDIT: { label: "Credit", color: "text-green-600 bg-green-50" },
  CONSULTATION_LOCK: { label: "Locked", color: "text-yellow-600 bg-yellow-50" },
  CONSULTATION_DEBIT: { label: "Session Charge", color: "text-red-600 bg-red-50" },
  CONSULTATION_REFUND: { label: "Refund", color: "text-blue-600 bg-blue-50" },
  PANDIT_CREDIT: { label: "Earnings", color: "text-green-600 bg-green-50" },
  WITHDRAWAL: { label: "Withdrawal", color: "text-red-600 bg-red-50" },
};

export default function UserWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const fetchData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        fetch("/api/wallet/balance"),
        fetch("/api/wallet/transactions"),
      ]);
      if (balRes.ok) {
        const b = await balRes.json();
        setBalance(b.balanceRupees || 0);
      }
      if (txRes.ok) {
        const tx = await txRes.json();
        setTransactions(tx);
      }
    } catch (err) {
      console.error("Failed to load wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecharge = async (amount: number) => {
    if (amount <= 0 || amount > 10000) {
      toast.error("Amount must be between ₹1 and ₹10,000");
      return;
    }
    setRecharging(true);
    try {
      // NOTE: Razorpay is disabled. Directly calling the test endpoint.
      const testRes = await fetch("/api/wallet/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (testRes.ok) {
        toast.success(`₹${amount} added to your wallet!`);
        fetchData();
        setCustomAmount("");
      } else {
        toast.error("Recharge failed");
      }

      /*
      const orderRes = await fetch("/api/wallet/recharge/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (orderRes.status === 503) {
        const testRes = await fetch("/api/wallet/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        if (testRes.ok) {
          toast.success(`₹${amount} added to your wallet!`);
          fetchData();
          setCustomAmount("");
        } else {
          toast.error("Recharge failed");
        }
        return;
      }

      if (!orderRes.ok) {
        toast.error("Failed to create payment order");
        return;
      }

      const { orderId, keyId } = await orderRes.json();

      const Razorpay = (window as typeof window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
      if (!Razorpay) {
        toast.error("Payment gateway not loaded");
        return;
      }

      const rzp = new Razorpay({
        key: keyId,
        amount: amount * 100,
        currency: "INR",
        name: "AstroGuru",
        description: `Wallet recharge ₹${amount}`,
        order_id: orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/wallet/recharge/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, amount }),
          });
          if (verifyRes.ok) {
            toast.success(`₹${amount} added to your wallet!`);
            fetchData();
            setCustomAmount("");
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#E8590C" },
      });
      rzp.open();
      */
    } catch {
      toast.error("Network error");
    } finally {
      setRecharging(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-cream min-h-screen py-24 px-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-4xl mx-auto">
      {/* <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-ink flex items-center gap-3">
          <Wallet className="w-9 h-9 text-bhagva" /> My Wallet
        </h1>
        <p className="text-ink-muted mt-2">Add balance to consult with astrologers.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-bhagva to-orange-600 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden mb-8">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Available Balance</p>
          <div className="text-5xl font-black mt-2">₹{balance.toFixed(2)}</div>
          <button onClick={fetchData} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Recharge Section */}
      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6 mb-8">
        <h2 className="font-bold text-ink text-lg mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-bhagva" /> Add Balance
        </h2>
        <p className="text-sm text-ink/60 mb-4">Pay securely via Razorpay. Test credits available when payments are not configured.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {RECHARGE_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => handleRecharge(amt)}
              disabled={recharging}
              className="py-3 rounded-xl border-2 border-bhagva/20 text-bhagva font-bold text-sm hover:bg-bhagva hover:text-white transition-all disabled:opacity-50"
            >
              ₹{amt}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Custom amount..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm font-medium"
          />
          <button
            onClick={() => handleRecharge(Number(customAmount))}
            disabled={recharging || !customAmount}
            className="px-6 py-3 bg-bhagva text-white rounded-xl font-bold text-sm hover:bg-bhagva/90 transition-colors disabled:opacity-50"
          >
            {recharging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink/5">
          <h2 className="font-bold text-ink text-lg">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-ink-muted">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No transactions yet. Add balance to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {transactions.map((tx) => {
              const info = typeLabels[tx.type] || { label: tx.type, color: "text-ink bg-ink/5" };
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="px-6 py-4 flex items-center gap-4 hover:bg-cream/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color}`}>
                    {isPositive ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{tx.description}</div>
                    <div className="text-xs text-ink/50 mt-0.5">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}₹{(Math.abs(tx.amount) / 100).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
