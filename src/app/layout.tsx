import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jhovey's Touch | Book an appointment",
  description:
    "A little time for you. Request your next appointment at Jhovey's Touch, a salon for women.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
