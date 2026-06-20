import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/theme-context";
import { ThemeTransition } from "@/components/theme-transition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Revia Admin Dashboard",
  description: "Admin dashboard powered by Next.js",
  icons: {
    icon: "/revia-icon.png",
    shortcut: "/revia-icon.png",
    apple: "/revia-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <ToasterProvider />
          <ThemeTransition />
        </ThemeProvider>
      </body>
    </html>
  );
}
