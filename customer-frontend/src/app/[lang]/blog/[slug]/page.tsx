import { notFound } from "next/navigation";
import Footer from "@/components/landing/Footer";
import enLanding from "@/locales/en/landing.json";
import arLanding from "@/locales/ar/landing.json";
import ArticleDetail from "@/components/landing/ArticleDetail";
import NavBar from "@/components/landing/NavBar";
import TakeAction from "@/components/landing/TakeAction";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const t = lang === "ar" ? arLanding : enLanding;
  const articles = t.articles.items;

  const articleIndex = articles.findIndex((a) => a.slug === slug);
  if (articleIndex === -1) {
    notFound();
  }

  const article = articles[articleIndex];
  
  // Get 3 related articles (exclude current one)
  const relatedArticles = articles
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"}>
      <ArticleDetail 
        article={article as any} 
        relatedArticles={relatedArticles as any} 
        lang={lang} 
        t={t} 
      />
      <TakeAction lang={lang as "en" | "ar"} t={t} />
    </main>
  );
}
