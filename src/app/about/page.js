import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn more about Memo, the beautifully minimalist mobile-first journaling app.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[80vh] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">
        <Link href="/welcome" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          About Memo
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed max-w-none text-zinc-600 dark:text-zinc-300">
          <p>
            Memo is your personal digital workspace, built with the belief that a clear mind leads to a better life. We designed Memo to be a fast, beautifully minimalist, and secure place to capture your thoughts, log your daily journal, and manage your tasks.
          </p>
          <p>
            Developed by Sadguru Chenu, the platform focuses on privacy and simplicity, removing the clutter of traditional note-taking apps so you can focus on what truly matters: your ideas.
          </p>
          
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-10 mb-4">Our Mission</h2>
          <p>
            To provide a seamless, spaceless canvas that adapts to your workflow, whether you're brainstorming a new project on your phone or organizing your week's tasks on your desktop.
          </p>
        </div>
      </div>
    </div>
  );
}
