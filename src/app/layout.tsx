import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import CookieWrapper from './CookieWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopping Split",
  description: "A site to split ur groceries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('page loaded');
  return (
    <html lang="en">
      {/* <CookieWrapper> */}
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </body>
      {/* </CookieWrapper> */}
    </html>
  );
}
