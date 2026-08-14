"use client";

import Link from "next/link";
import { ArrowLeft, Shield, ExternalLink } from "lucide-react";

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] w-full py-4 space-y-10">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <div className="space-y-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              1. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us when you create an account, such as your email address and password. The content of your journals, thoughts, and tasks is stored securely.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect solely to provide, maintain, and improve our services, including authenticating your account and ensuring your data is safely synced across your devices.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              3. Data Security
            </h2>
            <p>
              Your data is solely yours. We use token-based authentication and secure database isolation to ensure that your personal notes and milestones are protected.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              4. Contact
            </h2>
            <p>
              If you have any questions regarding privacy, please contact the developer via{" "}
              <a
                href="https://sadguruchenu.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                sadguruchenu.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full pt-8 pb-4 border-t border-zinc-200/80 dark:border-zinc-800/80 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>&copy; {currentYear} Memo. Built by</span>
            <a
              href="https://sadguruchenu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline inline-flex items-center gap-0.5"
            >
              Sadguru Chenu
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
