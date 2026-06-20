"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar } from "@solar-icons/react";

interface ArticleContent {
  type: "heading" | "paragraph";
  text: string;
}

interface Article {
  slug: string;
  date: string;
  title: string;
  description: string;
  image: string;
  content: ArticleContent[];
}

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  lang: string;
  t: any;
}

export default function ArticleDetail({ article, relatedArticles, lang, t }: ArticleDetailProps) {
  const isRtl = lang === "ar";
  const moreContentTitle = lang === "ar" ? "المزيد من المحتوى الذي قد يفيدك" : "More Content You'll Find Useful";
  const viewAllBtn = t?.articles?.viewAllBtn || "View All";

  return (
    <article className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-7xl pt-32 lg:pt-40">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-brand-500 text-[13px] font-medium tracking-wide uppercase mb-6">
            <Calendar size={18} />
            {article.date}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] leading-[1.1] font-medium text-slate-900 mb-6 tracking-tight">
            {article.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            {article.description}
          </p>
        </div>

        {/* Hero Image Section */}
        <div className="mb-16 md:mb-24 w-full">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-3xl mx-auto mb-24 lg:mb-32 prose prose-lg prose-slate prose-headings:font-medium prose-p:text-slate-700 prose-p:leading-relaxed mx-auto">
          {article.content && article.content.length > 0 ? (
            article.content.map((block, idx) => {
              if (block.type === "heading") {
                return (
                  <h2 key={idx} className="text-3xl font-medium text-slate-900 mt-12 mb-6 tracking-tight">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "paragraph") {
                return (
                  <p key={idx} className="mb-6 text-lg text-slate-700">
                    {block.text}
                  </p>
                );
              }
              return null;
            })
          ) : (
            <p className="text-center text-slate-500 italic py-20">
              Content for this article is currently unavailable.
            </p>
          )}

          {/* Published Date at bottom of content */}
           {article.content && article.content.length > 0 && (
             <div className="mt-16 pt-8 border-t border-slate-200">
               <p className="text-[13px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                 PUBLISHED: {article.date}
               </p>
             </div>
           )}
        </div>

        {/* Related Articles Section */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-20 lg:mt-32">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 ${isRtl ? 'rtl' : 'ltr'}`}>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-900 tracking-tight max-w-md">
                {moreContentTitle}
              </h3>
              <Link 
                href={`/${lang}/knowledge-hub`}
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white rounded-full font-medium hover:bg-brand-600 transition-colors"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {viewAllBtn}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((item, idx) => (
                <Link key={idx} href={`/${lang}/blog/${item.slug}`} className="group flex flex-col h-full bg-white rounded-xl overflow-hidden hover: transition-shadow">
                  {/* Card Content Top */}
                  <div className="p-8 flex-grow flex flex-col">
                    <span className="text-[12px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4 block">
                      {item.date}
                    </span>
                    <h4 className="text-xl font-medium text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>
                  {/* Card Image Bottom */}
                  <div className="relative h-48 w-full mt-auto">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
