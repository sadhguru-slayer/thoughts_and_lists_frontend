"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white/50 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Log in to continue to your Journal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-600 dark:bg-green-950/50 dark:text-green-400">
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Email
                        </label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={otpSent && isOtpMode}
                            className={`w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 ${otpSent && isOtpMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {!isOtpMode && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-10 text-sm font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="text-right mt-1">
                                <Link href="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    )}

                    {isOtpMode && otpSent && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                OTP Code
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium tracking-widest outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100"
                                placeholder="123456"
                                maxLength={6}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            !isOtpMode ? "Sign In" : (!otpSent ? "Send OTP" : "Verify & Sign In")
                        )}
                    </button>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            type="button"
                            onClick={toggleMode}
                            disabled={loading}
                            className="w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                        >
                            {isOtpMode ? "Use password instead" : "Login with OTP instead"}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-zinc-900 hover:underline dark:text-zinc-50">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
