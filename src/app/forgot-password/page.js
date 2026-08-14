"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import OtpInput from "@/components/ui/OtpInput";

export default function ForgotPasswordPage() {
    const { requestPasswordReset, verifyResetOtp, resetPassword } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    // step 'email' | 'otp' | 'password'
    const [step, setStep] = useState("email");

    const getErrorMsg = (err, fallback) => {
        const detail = err.response?.data?.detail;
        if (!detail) return fallback;
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail)) return detail.map((d) => d.msg ?? String(d)).join(", ");
        return fallback;
    };

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

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }
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
        step === "email" ? "Send Reset Code" :
        step === "otp"   ? "Verify OTP" :
                           "Reset Password";

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
                        Memo · Account Recovery
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.2]">
                        Reset Password
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                        {step === "email" ? "Enter your email to receive a reset code." :
                         step === "otp"   ? "Enter the OTP sent to your email." :
                                            "Choose a new password."}
                    </p>
                </div>

                {/* Form Card */}
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
                    <form onSubmit={currentSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs font-semibold text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={step !== "email" || done}
                                className={`w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950 ${step !== "email" || done ? "opacity-50 cursor-not-allowed" : "hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {step === "otp" && (
                                <motion.div
                                    key="otp"
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

                        <AnimatePresence mode="wait">
                            {step === "password" && (
                                <motion.div
                                    key="passwords"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                disabled={done}
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 pr-10 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={done}
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 pr-10 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
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
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : buttonLabel}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Remember your password?{" "}
                    <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-50 font-bold ml-1">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
