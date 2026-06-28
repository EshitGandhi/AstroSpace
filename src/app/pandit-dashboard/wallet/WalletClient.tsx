"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

const typeLabels: Record<string, { label: string; color: string }> = {
  RECHARGE: { label: "Recharge", color: "text-green-600 bg-green-50" },
  ADMIN_CREDIT: { label: "Credit", color: "text-green-600 bg-green-50" },
  CONSULTATION_LOCK: { label: "Locked", color: "text-yellow-600 bg-yellow-50" },
  CONSULTATION_DEBIT: { label: "Session Charge", color: "text-red-600 bg-red-50" },
  CONSULTATION_REFUND: { label: "Refund", color: "text-blue-600 bg-blue-50" },
  PANDIT_CREDIT: { label: "Earnings", color: "text-green-600 bg-green-50" },
  WITHDRAWAL: { label: "Withdrawal", color: "text-red-600 bg-red-50" },
};

export default function WalletClient() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink flex items-center gap-3">
          <Wallet className="w-8 h-8 text-bhagva" />
          Wallet & Earnings
        </h1>
        <p className="text-ink-muted mt-2">
          Track your earnings and transaction history.
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-bhagva to-orange-600 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Current Balance</p>
          <div className="text-5xl font-black mt-2">₹{balance.toFixed(2)}</div>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
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
            <p>No transactions yet.</p>
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
