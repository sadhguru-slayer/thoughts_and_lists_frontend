"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "./api";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = Cookies.get("access_token");
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
            const guestOnlyRoutes = ["/", "/login", "/register", "/forgot-password"];
            const publicRoutes = [...guestOnlyRoutes, "/about", "/privacy", "/terms"];
            
            // console.log(guestOnlyRoutes,publicRoutes,pathname);
            if (!user && !publicRoutes.includes(pathname)) {
                router.replace("/login");
            }
            // Redirect authenticated users away from guest-only routes
            else if (user && guestOnlyRoutes.includes(pathname)) {
                router.push("/dashboard");
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

        Cookies.set("access_token", res.data.access_token, { expires: 7, path: "/", sameSite: "Lax" });
        if (res.data.refresh_token) {
            Cookies.set("refresh_token", res.data.refresh_token, { expires: 7, path: "/", sameSite: "Lax" });
        }
        setUser({ token: res.data.access_token });
        router.push("/dashboard");
    };

    const requestOtp = async (email) => {
        await api.post("/api/v1/auth/request-otp", { email });
    };

    const verifyOtp = async (email, otp) => {
        const res = await api.post("/api/v1/auth/verify-otp", { email, otp });
        Cookies.set("access_token", res.data.access_token, { expires: 7, path: "/", sameSite: "Lax" });
        if (res.data.refresh_token) {
            Cookies.set("refresh_token", res.data.refresh_token, { expires: 7, path: "/", sameSite: "Lax" });
        }
        setUser({ token: res.data.access_token });
        router.push("/dashboard");
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

    const requestRegisterOtp = async (email) => {
        await api.post("/api/v1/auth/request-register-otp", { email });
    };

    const verifyRegisterOtp = async (email, otp) => {
        const res = await api.post("/api/v1/auth/verify-register-otp", { email, otp });
        return res.data.register_token;
    };

    const register = async (registerToken, password) => {
        const res = await api.post(
            "/api/v1/auth/register", 
            { password, role: "user" },
            { headers: { Authorization: `Bearer ${registerToken}` } }
        );
        Cookies.set("access_token", res.data.access_token, { expires: 7, path: "/", sameSite: "Lax" });
        if (res.data.refresh_token) {
            Cookies.set("refresh_token", res.data.refresh_token, { expires: 7, path: "/", sameSite: "Lax" });
        }
        setUser({ token: res.data.access_token });
        router.push("/dashboard");
    };

    const logout = () => {
        Cookies.remove("access_token", { path: "/" });
        Cookies.remove("refresh_token", { path: "/" });
        setUser(null);

        // console.log(pathname);

        if (pathname === "/") {
            router.replace("/");
        } else {
            router.replace("/login");
        }
    };

    const getMe = async () => {
        const res = await api.get("/api/v1/auth/me");
        return res.data;
    };

    const updateSettings = async (settings) => {
        const res = await api.patch("/api/v1/auth/me/settings", settings);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, requestRegisterOtp, verifyRegisterOtp, register, logout, requestOtp, verifyOtp, requestPasswordReset, verifyResetOtp, resetPassword, getMe, updateSettings }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
