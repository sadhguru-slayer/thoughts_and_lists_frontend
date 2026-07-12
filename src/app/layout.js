import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { JournalProvider } from "@/lib/JournalContext";
import { ThoughtsProvider } from "@/lib/ThoughtsContext";
import { TasksProvider } from "@/lib/TasksContext";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/journal/Header";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://memo.sadguruchenu.in'),
  title: {
    default: "Memo",
    template: "%s | Memo"
  },
  description: "Memo — your personal space to journal, capture thoughts, and track tasks. A beautifully minimalist, mobile-first app designed to declutter your mind.",
  keywords: ["journal", "notes", "tasks", "memo", "minimalist", "tracker", "productivity", "sadguru chenu"],
  authors: [{ name: "Sadguru Chenu" }],
  openGraph: {
    title: "Memo",
    description: "Memo — your personal space to journal, capture thoughts, and track tasks.",
    url: "https://memo.sadguruchenu.in",
    siteName: "Memo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memo",
    description: "Memo — your personal space to journal, capture thoughts, and track tasks.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster richColors position="top-center" />
          <AuthProvider>
            <ThoughtsProvider>
              <TasksProvider>
                <JournalProvider>
                  <Header />
                  <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6">
                    {children}
                  </main>
                </JournalProvider>
              </TasksProvider>
            </ThoughtsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
