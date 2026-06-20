import PrivacyPolicy from "@/components/legal/PrivacyPolicy";
import TakeAction from "@/components/landing/TakeAction";
import { getDictionary } from "@/i18n";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { lang } = (await params) as { lang: 'en' | 'ar' };
  const t = await getDictionary(lang);

  const isAr = lang === 'ar';
  
  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <PrivacyPolicy lang={lang} t={t} />
      <TakeAction lang={lang} t={t} />
    </div>
  );
}
