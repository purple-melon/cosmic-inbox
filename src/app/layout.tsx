import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cosmic Inbox",
  description: "Capture messy sparks and clarify them into usable ideas."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <div className="min-h-screen flex flex-col items-center">
          <main className="w-full max-w-3xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

