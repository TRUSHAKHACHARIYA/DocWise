import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DocWise — Secure Multi-Document AI Workspace",
    template: "%s | DocWise",
  },
  description:
    "Grounded answers with citations across your document library. Multi-doc chat, 3-panel citation workspace, and document comparison for legal, compliance, and research teams.",
  keywords: [
    "document intelligence",
    "multi-document AI",
    "contract review",
    "RAG",
    "cited answers",
    "document comparison",
    "compliance",
  ],
  openGraph: {
    title: "DocWise — Secure Multi-Document AI Workspace",
    description:
      "Chat across your library with cited answers, verify sources in a 3-panel workspace, and compare documents side by side.",
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
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1814" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DocWise" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--cream)] text-[var(--ink)] transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer />
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
