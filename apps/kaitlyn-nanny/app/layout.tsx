import "./globals.css";

import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  // Slightly wider range for elegant hero headlines
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Care with Kaitlyn | Professional Childcare Services",
  description:
    "Thoughtful, professional childcare in the Bel Air area. Experienced, reliable care for your family's needs.",
  openGraph: {
    title: "Care with Kaitlyn | Professional Childcare Services",
    description:
      "Thoughtful, professional childcare in the Bel Air area. Experienced, reliable care for your family's needs.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`}>
      <body className="min-h-screen font-[var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}


