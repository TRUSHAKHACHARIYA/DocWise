import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DocWise — AI-Powered Document Q&A",
    template: "%s | DocWise",
  },
  description:
    "Upload any PDF or document. Ask questions in plain English. Get accurate, cited answers instantly. Built on RAG architecture.",
  keywords: ["document AI", "PDF chat", "RAG", "document Q&A", "AI assistant"],
  openGraph: {
    title: "DocWise — AI-Powered Document Q&A",
    description: "Chat with your documents. Get cited answers powered by Claude.",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DocWise" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
