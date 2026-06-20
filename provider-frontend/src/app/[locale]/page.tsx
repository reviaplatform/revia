import { redirect } from 'next/navigation';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Explicitly redirect to the localized login page
  redirect(`/${locale || 'en'}/login`);
}
