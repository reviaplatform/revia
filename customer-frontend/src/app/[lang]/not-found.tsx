import NotFoundContent from "@/components/common/NotFoundContent";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  
  // Detect language from referer if possible, otherwise default to Arabic
  const lang = referer.includes('/en/') ? 'en' : 'ar';

  return <NotFoundContent lang={lang} />;
}
