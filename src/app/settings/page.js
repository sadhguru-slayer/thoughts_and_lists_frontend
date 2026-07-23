"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { getMe, updateSettings, requestPasswordReset, logout } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);

    const [journalReminderActive, setJournalReminderActive] = useState(true);
    const [journalReminderTime, setJournalReminderTime] = useState("22:00:00");
    const [timezone, setTimezone] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getMe();
                setUser(userData);
                setJournalReminderActive(userData.journal_reminder_active ?? true);
                setJournalReminderTime(userData.journal_reminder_time || "22:00:00");

                // Automatically set timezone if not set properly or just rely on browser
                const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                setTimezone(userData.timezone || browserTz);
            } catch (err) {
                toast.error("Failed to load user settings");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [getMe]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await updateSettings({
                journal_reminder_active: journalReminderActive,
                journal_reminder_time: journalReminderTime,
                timezone: timezone
            });
            toast.success("Settings updated successfully!");
        } catch (err) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await requestPasswordReset(user.email);
            toast.success("Password reset OTP sent to your email.");
            // Log out and send to verify
            logout();
        } catch (err) {
            toast.error("Failed to request password reset");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 py-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your account settings and preferences.</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Reminders</h2>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100">
                                Daily Journal Reminder
                            </label>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Receive an email reminder to write your journal.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={journalReminderActive}
                                onChange={(e) => setJournalReminderActive(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-400 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                        </label>
                    </div>

                    {journalReminderActive && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100 mb-2 block">
                                    Reminder Time
                                </label>
                                <input
                                    type="time"
                                    value={journalReminderTime}
                                    onChange={(e) => setJournalReminderTime(e.target.value)}
                                    className="flex h-10 w-full md:w-[200px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-white dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 dark:[color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100 mb-2 block">
                                    Timezone
                                </label>
                                <input
                                    type="text"
                                    value={timezone}
                                    readOnly
                                    className="flex h-10 w-full md:w-[200px] rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 focus-visible:outline-none cursor-not-allowed"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Timezone is detected automatically.</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                        >
                            {saving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Account Security</h2>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">If you need to change your password, you can request a password reset OTP. This will log you out immediately.</p>
                        <button
                            onClick={handlePasswordReset}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 h-10 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                        >
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8 sm:hidden">
                <button
                    onClick={logout}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2"
                >
                    Log Out of ThoughtsHub
                </button>
            </div>
        </div>
    );
}
