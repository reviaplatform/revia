import type { Metadata } from 'next';
import '../globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SmoothScroll } from '@/components/SmoothScroll';

export const metadata: Metadata = {
  title: 'Revia Provider Platform',
  description: 'Provider Dashboard for Revia Platform',
  icons: {
    icon: '/favicon.png',
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Basic validation to prevent "undefined" or malformed locales
  const currentLocale = locale || 'en';
  const messages = await getMessages();

  return (
    <html lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Martian+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={currentLocale}>
          <AuthProvider>
            <TooltipProvider>
              <SmoothScroll />
              {children}
            </TooltipProvider>
            <Toaster position="top-right" />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
