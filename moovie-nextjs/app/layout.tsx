import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOOVI3 - Premium Movies & TV Shows",
  description: "Stream premium movies and TV shows. Powered by LinkShare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
