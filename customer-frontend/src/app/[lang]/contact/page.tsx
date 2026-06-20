import enLanding from "@/locales/en/landing.json";
import arLanding from "@/locales/ar/landing.json";
import ContactSection from "@/components/contact/ContactSection";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = lang === "ar" ? arLanding : enLanding;

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"}>
      <ContactSection lang={lang as "en" | "ar"} t={t} />
    </main>
  );
}
