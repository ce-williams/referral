import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Referral — Your next move, made clearer",
  description: "Evidence-led career intelligence for thoughtful career moves.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
