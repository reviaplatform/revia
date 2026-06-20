import CTA from '@/components/landing/CTA';
import { getDictionary } from '@/i18n';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/landing/NavBar';
import StarsIcon from '@/components/ui/StarsIcon';
import TakeAction from '@/components/landing/TakeAction';

export default async function KnowledgeHubPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { lang } = (await params) as { lang: 'en' | 'ar' };
  const t = await getDictionary(lang);
  const isRtl = lang === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden bg-white">
          <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1440px] relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 text-slate-900 text-sm font-bold tracking-widest uppercase mb-6">
              <StarsIcon weight="Bold" size={28} color="#318ffd" />
              {t.knowledgeHub.badge}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-slate-900 leading-[1.1] tracking-tight mb-8 whitespace-pre-line max-w-4xl mx-auto">
              {t.knowledgeHub.title}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.knowledgeHub.subtitle}
            </p>

            <Link 
              href={`/${lang}/#identity`}
              className="inline-block px-10 py-3.5 bg-brand-500 text-white font-medium rounded-full hover:bg-brand-600 transition-colors duration-300"
            >
              {t.knowledgeHub.aboutBtn}
            </Link>

          </div>
        </section>

        {/* 6 Grid Articles */}
        <section className="pb-32 relative z-10">
          <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1440px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {t.articles.items.map((article: any, index: number) => (
                <Link
                  href={`/${lang}/blog/${article.slug}`}
                  key={index}
                  className="flex flex-col md:flex-row lg:flex-col rounded-md overflow-hidden bg-[#f5f6f8] hover:bg-slate-200 transition-colors duration-300 h-full border border-slate-100 cursor-pointer"
                >
                  {/* Text Top/Left Half */}
                  <div className="p-8 pb-10 flex flex-col flex-grow md:w-1/2 lg:w-full md:justify-center">
                    <span className="text-xs font-medium tracking-widest text-slate-500 uppercase mb-4">
                      {article.date}
                    </span>
                    <h3 className="text-2xl font-semibold text-slate-900 leading-tight mb-4 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed max-w-[95%]">
                      {article.description}
                    </p>
                  </div>

                  {/* Image Bottom/Right Half */}
                  <div className="relative aspect-[4/3] md:aspect-auto lg:aspect-[4/3] w-full md:w-1/2 lg:w-full md:min-h-[300px] mt-auto md:mt-0 lg:mt-auto">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Reusing Global CTA & TakeAction */}
      <TakeAction lang={lang} t={t} />
      <CTA lang={lang} />
    </div>
  );
}
