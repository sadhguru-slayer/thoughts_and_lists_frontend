"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, ShieldCheck, Bell, LogOut } from "lucide-react";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";

function SectionCard({ icon: Icon, title, children }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <Icon className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
                {children}
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, disabled }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                disabled={disabled}
                onChange={onChange}
            />
            <div className="w-11 h-6 rounded-full transition-colors bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 peer-disabled:opacity-50">
                <span className={`absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
            </div>
        </label>
    );
}

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
                const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                setTimezone(userData.timezone || browserTz);
            } catch (err) {
                notify.error("Failed to load settings");
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
            notify.success("Settings saved");
        } catch (err) {
            notify.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await requestPasswordReset(user.email);
            notify.success("OTP sent", "Check your inbox then log back in.");
            logout();
        } catch (err) {
            notify.error("Failed to send reset OTP");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto flex flex-col gap-6 py-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your account and preferences.</p>
            </div>

            {/* Reminders */}
            <SectionCard icon={Bell} title="Reminders">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Daily journal reminder</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Receive an email reminder to write your journal.</p>
                    </div>
                    <Toggle
                        checked={journalReminderActive}
                        onChange={(e) => setJournalReminderActive(e.target.checked)}
                        disabled={saving}
                    />
                </div>

                {journalReminderActive && (
                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                                Reminder time
                            </label>
                            <input
                                type="time"
                                value={journalReminderTime}
                                onChange={(e) => setJournalReminderTime(e.target.value)}
                                disabled={saving}
                                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-shadow dark:[color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                                Timezone
                            </label>
                            <input
                                type="text"
                                value={timezone}
                                readOnly
                                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-400 dark:text-zinc-500 outline-none cursor-not-allowed"
                            />
                            <p className="text-[11px] text-zinc-400 mt-1">Auto-detected from browser.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-1">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold px-5 py-2.5 transition-all active:scale-95 hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                    </button>
                </div>
            </SectionCard>

            {/* Account Security */}
            <SectionCard icon={ShieldCheck} title="Account security">
                <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        To change your password, request a reset OTP — you'll be logged out immediately.
                    </p>
                    <button
                        onClick={handlePasswordReset}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                    >
                        Reset password
                    </button>
                </div>
            </SectionCard>

            {/* Danger / Logout — mobile only (desktop has header button) */}
            <div className="flex justify-center sm:hidden pt-2">
                <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2"
                >
                    <LogOut className="w-4 h-4" />
                    Log out
                </button>
            </div>
        </div>
    );
}
