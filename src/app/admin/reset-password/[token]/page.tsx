"use client";

import { useState } from "react";
import { Lock, Loader2, CheckCircle2, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/login"), 3000);
      } else {
        setError(data.error || "Reset link may be invalid or expired");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 border border-slate-100 p-2">
             <img src="/eagle-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Eagle Revolution</h1>
          <p className="text-slate-500 text-sm mt-1">Admin Control Center</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
          <div className="p-8">
            {success ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  Your password has been updated. Redirecting you to the login page...
                </p>
                <Link 
                  href="/admin/login" 
                  className="bg-[#2430d2] text-white font-bold py-3 px-6 rounded-xl block text-center"
                >
                  Login Now
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Set New Password</h2>
                  <p className="text-slate-500 text-sm">
                    Enter your new password below. Make sure it's secure.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2430d2] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type={showPass ? "text" : "password"} 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 outline-none focus:ring-2 focus:ring-[#2430d2]/20 focus:border-[#2430d2] transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2430d2] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type={showPass ? "text" : "password"} 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 outline-none focus:ring-2 focus:ring-[#2430d2]/20 focus:border-[#2430d2] transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 flex-shrink-0" />
                       {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2430d2] text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(36,48,210,0.2)] hover:shadow-[0_15px_25px_rgba(36,48,210,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} Eagle Revolution. All rights reserved.
        </p>
      </div>
    </div>
  );
}
