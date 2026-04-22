import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shri Balaji Sarkar Firms - हिसाब किताब",
  description: "रेती कारोबार इन्वेंटरी और अकाउंटिंग सिस्टम",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
