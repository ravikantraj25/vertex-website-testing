import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import Providers from './providers';
import PostHogProvider from '../components/PostHogProvider';

export const metadata: Metadata = {
  title: 'Vertex',
  description: 'This is built by students of ETE dept, DSCE.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-white">
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
