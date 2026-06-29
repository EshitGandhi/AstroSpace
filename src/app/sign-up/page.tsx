"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthColor = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        router.push("/sign-in");
        return;
      }

      router.push("/profile-setup");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-tint/40 to-cream flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient decoration */}
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
          {/* Header strip */}
          <div className="bg-gradient-to-r from-night to-night-2 px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <span className="text-white font-bold font-heading text-lg">AstroGuru</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading">Begin your journey</h1>
            <p className="text-white/60 text-sm mt-1">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
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

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input id="name" type="text" required autoComplete="name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Eshit Gandhi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-cream/60 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-ink mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input id="reg-email" type="email" required autoComplete="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-cream/60 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-ink mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input id="reg-password" type={showPassword ? "text" : "password"} required autoComplete="new-password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-ink/10 bg-cream/60 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-ink/10"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{strengthLabel && `Strength: ${strengthLabel}`}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-ink mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input id="confirm" type={showPassword ? "text" : "password"} required
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-ink/10 bg-cream/60 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all"
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="relative w-full py-3.5 rounded-xl bg-bhagva text-white font-bold text-sm overflow-hidden shadow-lg shadow-bhagva/25 hover:shadow-bhagva/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {!loading && (
                <motion.div className="absolute inset-0 bg-white/10" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Account"}
              </span>
            </motion.button>

            <div className="text-center space-y-3 mt-2">
              <p className="text-sm text-ink-muted">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-bhagva font-semibold hover:underline">Sign in</Link>
              </p>
              <div className="h-px bg-ink/10 w-full" />
              <Link href="/astrologer-register" className="inline-block text-sm text-night font-bold hover:text-bhagva transition-colors">
                Register as Astrologer &rarr;
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
