"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import OtpInput from "@/components/ui/OtpInput";

const passwordRules = [
    {
        label: "At least 8 characters",
        test: (value) => value.length >= 8,
    },
    {
        label: "At least one number",
        test: (value) => /\d/.test(value),
    },
    {
        label: "At least one special character",
        test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
    },
];

export default function RegisterPage() {
    const { requestRegisterOtp, verifyRegisterOtp, register } = useAuth();
    
    // Step state: 1 = Email, 2 = OTP, 3 = Password
    const [step, setStep] = useState(1);
    
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [registerToken, setRegisterToken] = useState("");
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordValid = passwordRules.every((rule) => rule.test(password));
    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await requestRegisterOtp(email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setError("");
        setLoading(true);
        try {
            const token = await verifyRegisterOtp(email, otp);
            setRegisterToken(token);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordValid) {
            setError("Password must be at least 8 characters and include a number and special character.");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register(registerToken, password);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create account.");
            setLoading(false);
        }
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
                        Create an account
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Start writing your memos today.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleEmailSubmit} 
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 dark:text-white bg-white px-4 py-3 text-sm font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleOtpSubmit} 
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Verification Code
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => setStep(1)}
                                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Change email
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    We sent a 6-digit code to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>
                                </p>
                                <OtpInput value={otp} onChange={setOtp} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form 
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handlePasswordSubmit} 
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-500 outline-none cursor-not-allowed dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border dark:text-white border-zinc-200 bg-white px-4 py-3 pr-10 text-sm font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full rounded-xl border dark:text-white border-zinc-200 bg-white px-4 py-3 pr-10 text-sm font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:border-zinc-100"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {(password.length > 0 || confirmPassword.length > 0) && (
                                <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300">
                                    <p className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Password requirements</p>
                                    <ul className="space-y-1">
                                        {passwordRules.map((rule) => {
                                            const valid = rule.test(password);
                                            return (
                                                <li
                                                    key={rule.label}
                                                    className={valid ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}
                                                >
                                                    <span className="inline-block h-4 w-4 mr-2">{valid ? "✓" : "•"}</span>
                                                    {rule.label}
                                                </li>
                                            );
                                        })}
                                        <li
                                            className={passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : confirmPassword.length === 0 ? "text-zinc-500 dark:text-zinc-400" : "text-red-600 dark:text-red-400"}
                                        >
                                            <span className="inline-block h-4 w-4 mr-2">{passwordsMatch ? "✓" : "•"}</span>
                                            Passwords match
                                        </li>
                                    </ul>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="mt-6 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-50">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
