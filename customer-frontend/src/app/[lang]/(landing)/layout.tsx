import NavBar from "@/components/landing/NavBar";
import Footer from "@/components/landing/Footer";
import { getDictionary, type Locale } from "@/i18n";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langStr } = await params;
  const lang = langStr as Locale;
  const t = await getDictionary(lang);

  return (
    <>
      {children}
      <Footer lang={lang} t={t} />
    </>
  );
}
