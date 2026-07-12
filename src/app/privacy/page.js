import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the Memo app.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-[80vh] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        <Link href="/welcome" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          Privacy Policy
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed max-w-none text-zinc-600 dark:text-zinc-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you create an account, such as your email address and password. The content of your journals, memos, and tasks is stored securely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including authenticating your account and ensuring your data is safely synced across your devices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">3. Data Security</h2>
            <p>
              Your data is solely yours. We use standard security protocols, including token-based authentication, to ensure that your personal milestones and thoughts are locked up safe and cannot be accessed by unauthorized parties.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
