"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setUser({ token });
        }
        setLoading(false);

        const handleUnauthorized = () => {
            logout();
        };
        window.addEventListener("auth-unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth-unauthorized", handleUnauthorized);
    }, []);

    useEffect(() => {
        if (!loading) {
            const publicRoutes = ["/login", "/register", "/forgot-password"];
            // Redirect unauthenticated users
            if (!user && !publicRoutes.includes(pathname)) {
                router.push("/login");
            }
            // Redirect authenticated users away from public routes
            else if (user && publicRoutes.includes(pathname)) {
                router.push("/");
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const res = await api.post("/api/v1/auth/token", formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        localStorage.setItem("access_token", res.data.access_token);
        if (res.data.refresh_token) {
            localStorage.setItem("refresh_token", res.data.refresh_token);
        }
        setUser({ token: res.data.access_token });
        router.push("/");
    };

    const requestOtp = async (email) => {
        await api.post("/api/v1/auth/request-otp", { email });
    };

    const verifyOtp = async (email, otp) => {
        const res = await api.post("/api/v1/auth/verify-otp", { email, otp });
        localStorage.setItem("access_token", res.data.access_token);
        if (res.data.refresh_token) {
            localStorage.setItem("refresh_token", res.data.refresh_token);
        }
        setUser({ token: res.data.access_token });
        router.push("/");
    };

    const requestPasswordReset = async (email) => {
        await api.post("/api/v1/auth/request-password-reset", { email });
    };

    const verifyResetOtp = async (email, otp) => {
        const res = await api.post("/api/v1/auth/verify-reset-otp", { email, otp });
        return res.data.reset_token;
    };

    const resetPassword = async (resetToken, newPassword) => {
        await api.post(
            "/api/v1/auth/reset-password",
            { new_password: newPassword }, // body
            { headers: { Authorization: `Bearer ${resetToken}` } }
        );
    };

    const register = async (email, password) => {
        // Backend register endpoint requires: email, password, role 'user'
        await api.post("/api/v1/auth/register", { email, password, role: "user" });
        // We login using form_data.username which actually maps to email in the token endpoint handler
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, requestOtp, verifyOtp, requestPasswordReset, verifyResetOtp, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
