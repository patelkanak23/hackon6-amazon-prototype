import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://main.d2a6skx8ok931x.amplifyapp.com"),
  title: "Amazon Now - Instant Cart",
  description: "Instant AI-powered cart for urgent shopping needs.",
  applicationName: "Amazon Now",

  openGraph: {
    title: "Amazon Now - Instant Cart",
    description: "Instant AI-powered cart for urgent shopping needs.",
    url: "https://main.d2a6skx8ok931x.amplifyapp.com",
    siteName: "Amazon Now",
    type: "website",
    images: [
      {
        url: "./og-image.png",
        width: 1200,
        height: 630,
        alt: "Amazon Now Instant Cart",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Amazon Now - Instant Cart",
    description: "Instant AI-powered cart for urgent shopping needs.",
    images: ["./og-image.png"],
  },

  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "./apple-touch-icon.png",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
