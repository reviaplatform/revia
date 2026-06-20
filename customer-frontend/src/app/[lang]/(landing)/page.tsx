import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import OurIdentity from '@/components/landing/OurIdentity';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BrandBar from '@/components/landing/BrandBar';
import dynamic from 'next/dynamic';

const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'));
const WhatWeRepair = dynamic(() => import('@/components/landing/WhatWeRepair'));
const ArticlesSection = dynamic(() => import('@/components/landing/ArticlesSection'));
const TakeAction = dynamic(() => import('@/components/landing/TakeAction'));
import { getDictionary } from '@/i18n';

export default async function LandingPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { lang } = (await params) as { lang: 'en' | 'ar' };
  const t = await getDictionary(lang);

  return (
    <>
      <Hero lang={lang} t={t} />
      <BrandBar lang={lang} t={t} />
      <ProblemSection lang={lang} t={t} />
      <OurIdentity lang={lang} t={t} />
      <FeaturesSection lang={lang} t={t} />
      <HowItWorks lang={lang} t={t} />
      <WhatWeRepair lang={lang} t={t} />
      <ArticlesSection lang={lang} t={t} />
      <TakeAction lang={lang} t={t} />
    </>
  );
}
