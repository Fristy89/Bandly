import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Kaushan_Script } from "next/font/google";
import { themeInitScript } from "@/shared/lib/theme";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The wordmark only — a bold, hand-lettered brush script for "Bandly"
// itself. Not used for body/display copy; see BrandMark.
const kaushanScript = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Bandly",
    template: "%s · Bandly",
  },
  description:
    "Bandly is the artist operating system — release planning, booking, rights, and grants in one calm place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable} ${kaushanScript.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-paper font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
