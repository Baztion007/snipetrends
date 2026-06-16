"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowLeft, LogIn, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface AdminUser {
  username: string;
  name: string | null;
  role: string;
}

interface AdminLoginProps {
  onLoggedIn: (user: AdminUser) => void;
  onBack: () => void;
}

export function AdminLogin({ onLoggedIn, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter both your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      toast.success("Welcome back!", {
        description: `Signed in as ${data.user.username}`,
      });
      onLoggedIn(data.user);
    } catch {
      setError("Network error. Please check your connection and retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <button
        onClick={onBack}
        className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to store
      </button>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl shadow-2xl p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
                <ShieldCheck className="h-7 w-7 text-zinc-950" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Sign In</h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                Manage your affiliate storefront
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-200">
                  Username
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="border-zinc-700 bg-zinc-950/60 pl-9 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border-zinc-700 bg-zinc-950/60 pl-9 pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 font-semibold hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/20 h-11"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/40 border-t-zinc-950" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-zinc-500">
              <p className="font-medium text-zinc-400 mb-1">Demo credentials</p>
              <p>
                Username:{" "}
                <code className="text-amber-400 font-mono">admin</code> · Password:{" "}
                <code className="text-amber-400 font-mono">admin123</code>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminLogin;
