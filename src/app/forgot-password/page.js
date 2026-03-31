"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// step: 'email' | 'otp' | 'password'
export default function ForgotPasswordPage() {
    const { requestPasswordReset, verifyResetOtp, resetPassword } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState(null); // scoped reset_token from backend
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    // step 'email' -> 'otp' -> 'password'
    const [step, setStep] = useState("email");

    // Safely extract error message from FastAPI responses (detail can be string or array of objects)
    const getErrorMsg = (err, fallback) => {
        const detail = err.response?.data?.detail;
        if (!detail) return fallback;
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail)) return detail.map((d) => d.msg ?? String(d)).join(", ");
        return fallback;
    };

    // ── Step 1: request OTP ──────────────────────────────────────
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await requestPasswordReset(email);
            setStep("otp");
            toast.success("OTP sent! Check your inbox.");
        } catch (err) {
            setError(getErrorMsg(err, "Failed to send OTP."));
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: verify OTP with backend — only advances if backend confirms ──
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const token = await verifyResetOtp(email, otp);
            setResetToken(token);
            setStep("password");
        } catch (err) {
            setError(getErrorMsg(err, "Invalid or expired OTP."));
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: reset password using the scoped reset_token ────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(resetToken, newPassword);
            setDone(true);

            let seconds = 5;
            const toastId = toast.success(`Password reset! Redirecting to login in ${seconds}s…`, {
                duration: 5500,
            });

            const interval = setInterval(() => {
                seconds -= 1;
                if (seconds > 0) {
                    toast.success(`Password reset! Redirecting to login in ${seconds}s…`, {
                        id: toastId,
                        duration: seconds * 1000 + 500,
                    });
                } else {
                    clearInterval(interval);
                    router.push("/login");
                }
            }, 1000);
        } catch (err) {
            setError(getErrorMsg(err, "Failed to reset password."));
            setLoading(false);
        }
    };

    const currentSubmit =
        step === "email" ? handleRequestOtp :
        step === "otp"   ? handleVerifyOtp   :
                           handleResetPassword;

    const buttonLabel = done ? "Redirecting…" :
        step === "email"    ? "Send Reset Code" :
        step === "otp"      ? "Verify OTP" :
                              "Reset Password";

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white/50 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Reset Password
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {step === "email"    ? "Enter your email to receive a reset code." :
                         step === "otp"      ? "Enter the OTP sent to your email." :
                                              "Choose a new password."}
                    </p>
                </div>

                <form onSubmit={currentSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Email — always visible but locks after step 1 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={step !== "email" || done}
                            className={`w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 ${step !== "email" || done ? "opacity-50 cursor-not-allowed" : "hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    {/* OTP — only visible in otp step */}
                    <AnimatePresence>
                        {step === "otp" && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
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
                                    autoFocus
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Password fields — only visible in password step */}
                    <AnimatePresence>
                        {step === "password" && (
                            <motion.div
                                key="passwords"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={done}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-10 text-sm font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={done}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-10 text-sm font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading || done}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonLabel}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Remember your password?{" "}
                    <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-50">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
