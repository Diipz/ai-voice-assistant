import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Voice prompt AI assistant",
  description: "An audio to speech & text prompt AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
