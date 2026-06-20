import type { Metadata } from "next";
import { Host_Grotesk, Cairo } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";
import { getDictionary } from "@/i18n";
import { AuthContextProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import DynamicAuthModal from "@/components/auth/DynamicAuthModal";
import NavBar from "@/components/landing/NavBar";

const hostGrotesk = Host_Grotesk({ subsets: ["latin"], variable: "--font-host-grotesk", display: "swap" });
const cairo = Cairo({ 
  subsets: ["arabic"], 
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Revia | AI-Powered Device Repair",
  description: "Fix your device with AI precision. No hidden fees. Live tracking.",
  icons: {
    icon: "/revia-icon-white.png",
  },
  alternates: {
    languages: {
      'en': '/en',
      'ar': '/ar',
    },
  },
};

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<any>;
}>) {
  const { lang } = (await params) as { lang: 'en' | 'ar' };
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? cairo.variable : hostGrotesk.variable;
  const t = await getDictionary(lang);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lightsalmon-ibis-912038.hostingersite.com';

  return (
    <html lang={lang} dir={dir} className={`${hostGrotesk.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to the backend API and WebSocket server */}
        <link rel="preconnect" href={backendUrl} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={backendUrl} />
      </head>
      <body className={`font-sans antialiased text-slate-900 bg-white min-h-screen flex flex-col ${fontClass}`}>
        <AuthContextProvider>
          <LayoutWrapper key="layout-wrapper" lang={lang} t={t} navbar={<NavBar lang={lang} t={t} />}>
            {children}
          </LayoutWrapper>
          <DynamicAuthModal key="auth-modal" />
        </AuthContextProvider>
      </body>
    </html>
  );
}
