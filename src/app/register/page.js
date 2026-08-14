"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
                        Memo · Start Writing
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.2]">
                        Create an account
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                        Join Memo and set up your personal command center in seconds.
                    </p>
                </div>

                {/* Form Card */}
                <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs font-semibold text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                onSubmit={handleEmailSubmit} 
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Continue"}
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                onSubmit={handleOtpSubmit} 
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            Verification Code
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)}
                                            className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Change email
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                                        We sent a 6-digit code to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>
                                    </p>
                                    <OtpInput value={otp} onChange={setOtp} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Code"}
                                </button>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.form 
                                key="step3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                onSubmit={handlePasswordSubmit} 
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        className="w-full rounded-xl border border-zinc-200/50 bg-zinc-100 dark:bg-zinc-900/10 px-3.5 py-2.5 text-xs font-semibold text-zinc-400 cursor-not-allowed outline-none dark:border-zinc-800/50 dark:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-2">
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
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 pr-10 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:bg-zinc-950"
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {(password.length > 0 || confirmPassword.length > 0) && (
                                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 p-4 text-xs text-zinc-600 dark:bg-zinc-900/10 dark:text-zinc-400 space-y-2">
                                        <p className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] uppercase tracking-wider">Password requirements</p>
                                        <ul className="space-y-1.5 font-semibold">
                                            {passwordRules.map((rule) => {
                                                const valid = rule.test(password);
                                                return (
                                                    <li
                                                        key={rule.label}
                                                        className={valid ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}
                                                    >
                                                        <span className="inline-block mr-2 font-bold">{valid ? "✓" : "•"}</span>
                                                        {rule.label}
                                                    </li>
                                                );
                                            })}
                                            <li
                                                className={passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : confirmPassword.length === 0 ? "text-zinc-400 dark:text-zinc-500" : "text-red-600 dark:text-red-400"}
                                            >
                                                <span className="inline-block mr-2 font-bold">{passwordsMatch ? "✓" : "•"}</span>
                                                Passwords match
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign Up"}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-50 font-bold ml-1">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
