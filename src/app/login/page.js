"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";

export default function LoginPage() {
    const { login, requestOtp, verifyOtp } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);

    // Modes: 'login', 'otp'
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            if (isOtpMode) {
                if (!otpSent) {
                    await requestOtp(username);
                    setOtpSent(true);
                    setMessage("OTP sent successfully. Please check your email.");
                } else {
                    if (otp.length !== 6) {
                        setError("Please enter a valid 6-digit OTP.");
                        setLoading(false);
                        return;
                    }
                    await verifyOtp(username, otp);
                }
            } else {
                await login(username, password);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsOtpMode(!isOtpMode);
        setOtpSent(false);
        setError("");
        setMessage("");
        setOtp("");
        setPassword("");
    };

    return (
        <div className="flex min-h-[75vh] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm flex flex-col space-y-6"
            >
                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Memo · Welcome Back
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.2]">
                        Sign in to your space
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                        Your personal space to capture instant thoughts, structured journals, and tasks.
                    </p>
                </div>

                {/* Form Card */}
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs font-semibold text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="rounded-xl border border-green-200 bg-green-50/50 p-3 text-xs font-semibold text-green-600 dark:border-green-950/20 dark:bg-green-950/20 dark:text-green-400">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={otpSent && isOtpMode}
                                className={`w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950 ${otpSent && isOtpMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {!isOtpMode && (
                                <motion.div
                                    key="password-section"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 pr-10 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <Link href="/forgot-password" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {isOtpMode && otpSent && (
                                <motion.div
                                    key="otp-section"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Verification Code
                                    </label>
                                    <OtpInput value={otp} onChange={setOtp} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                                !isOtpMode ? "Sign In" : (!otpSent ? "Send OTP" : "Verify & Sign In")
                            )}
                        </button>

                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                type="button"
                                onClick={toggleMode}
                                disabled={loading}
                                className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                            >
                                {isOtpMode ? "Use password instead" : "Login with OTP instead"}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-zinc-900 hover:underline dark:text-zinc-50 font-bold ml-1">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
