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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
