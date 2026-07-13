"use client";

import { useRef } from "react";

export default function OtpInput({ value = "", onChange, length = 6 }) {
    const inputsRef = useRef([]);

    // Ensure inputsRef.current matches length
    if (inputsRef.current.length !== length) {
        inputsRef.current = Array(length).fill(null).map((_, i) => inputsRef.current[i] || null);
    }

    const otpArray = value.split("").concat(Array(length).fill("")).slice(0, length);

    const handleInputChange = (index, val) => {
        const char = val.slice(-1); // Take the last character typed
        if (char && !/^[0-9]$/.test(char)) return;

        const newOtpArray = [...otpArray];
        newOtpArray[index] = char;
        const newValue = newOtpArray.join("");
        onChange(newValue);

        // Auto-focus next input if a char was added
        if (char && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newOtpArray = [...otpArray];
            if (otpArray[index]) {
                newOtpArray[index] = "";
                onChange(newOtpArray.join(""));
            } else if (index > 0) {
                newOtpArray[index - 1] = "";
                onChange(newOtpArray.join(""));
                inputsRef.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (!/^\d+$/.test(pastedData)) return; // Only allow digits

        const pastedOtp = pastedData.slice(0, length);
        onChange(pastedOtp);

        // Focus the last input that got filled, or the last input overall
        const focusIndex = Math.min(pastedOtp.length, length - 1);
        inputsRef.current[focusIndex]?.focus();
    };

    return (
        <div className="flex justify-between gap-2 pt-2">
            {otpArray.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition"
                />
            ))}
        </div>
    );
}
