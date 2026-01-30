import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archie Task Board",
  description: "Local task management for Tallie.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
