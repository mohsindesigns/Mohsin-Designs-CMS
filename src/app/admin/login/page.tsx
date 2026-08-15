"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    document.title = "Login ‹ Eagle Dashboard Mohsin Design";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[320px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
             <div className="inline-block p-4 bg-white rounded shadow-sm border border-[#dcdcde] hover:border-[#2271b1] transition-colors">
                <Shield className="w-12 h-12 text-[#2271b1]" />
             </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#dcdcde] shadow-sm p-6 rounded-sm">
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 bg-white border-l-4 border-[#d63638] shadow-sm p-3 text-[13px] text-[#1d2327]"
              >
                <div className="flex gap-2">
                   <AlertCircle className="w-4 h-4 text-[#d63638] shrink-0 mt-0.5" />
                   <p><strong>Error</strong>: {error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[14px] text-[#1d2327] mb-1 font-medium">Username or Email Address</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[14px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[14px] text-[#1d2327] font-medium">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-[#8c8f94] rounded-[3px] px-3 py-2 pr-10 text-[14px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c8f94] hover:text-[#1d2327]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-[13px] text-[#50575e] cursor-pointer">
                <input type="checkbox" className="rounded-[2px] border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]" />
                Remember Me
              </label>
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="bg-[#2271b1] hover:bg-[#135e96] disabled:bg-[#a7aaad] text-white text-[13px] font-bold px-4 py-2 rounded-[3px] transition-colors shadow-sm"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
        </div>

        {/* Links */}
        <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#2271b1]">
           <Link href="/admin/forgot-password" title="Lost your password?" className="hover:text-[#135e96]">Lost your password?</Link>
           <Link href="/" title="Go to Eagle Revolution" className="hover:text-[#135e96]">← Go to Eagle Revolution</Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
