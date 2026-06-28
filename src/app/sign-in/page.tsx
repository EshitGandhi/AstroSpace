"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email.toLowerCase().trim(),
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.push(callbackUrl);
    } else {
      router.push("/profile-setup");
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-cream/60 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full pl-10 pr-11 py-3 rounded-xl border border-ink/10 bg-cream/60 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        className="relative w-full py-3.5 rounded-xl bg-bhagva text-white font-bold text-sm overflow-hidden shadow-lg shadow-bhagva/25 hover:shadow-bhagva/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign In"}
        </span>
      </motion.button>

      <div className="text-center pt-1 space-y-3">
        <p className="text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-bhagva font-semibold hover:underline">
            Create one
          </Link>
        </p>
        <div className="h-px bg-ink/10 w-full" />
        <Link href="/astrologer-register" className="inline-block text-sm text-night font-bold hover:text-bhagva transition-colors">
          Register as Astrologer &rarr;
        </Link>
      </div>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-tint/40 to-cream flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-bhagva/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gold/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-ink/5 overflow-hidden">
          <div className="bg-gradient-to-r from-bhagva to-bhagva/80 px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-white fill-white" />
              <span className="text-white font-bold font-heading text-lg">AstroGuru</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading">Welcome back</h1>
            <p className="text-white/70 text-sm mt-1">Sign in to your cosmic journey</p>
          </div>

          <Suspense fallback={<div className="p-8 text-center text-ink-muted">Loading...</div>}>
            <SignInForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
