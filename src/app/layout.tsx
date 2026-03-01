import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import PostHogProvider from '../components/PostHogProvider'

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertex",
  description: "This is built by students of ETE dept, DSCE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${googleSansFlex.variable} antialiased bg-neutral-950 text-white`}
      >
        <PostHogProvider>
         <Providers>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        {children}
         <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}

          strategy="afterInteractive"
        />
          </Providers>
          </PostHogProvider>
      </body>
    </html>
  );
}
