import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for the Memo app.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-[80vh] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        <Link href="/welcome" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          Terms of Service
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed max-w-none text-zinc-600 dark:text-zinc-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Memo, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">2. User Accounts</h2>
            <p>
              To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">3. User Content</h2>
            <p>
              You retain all of your ownership rights in your content. By submitting content to Memo, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service only for the purpose of providing the service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">4. Prohibited Conduct</h2>
            <p>
              You agree not to use the Service for any unlawful purpose or to violate any laws in your jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
