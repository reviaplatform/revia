"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, CloseCircle, ArrowLeft, Home2 } from '@solar-icons/react';
import Link from 'next/link';

function PaymentStatusContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const isAr = lang === 'ar';

  // Kashier typical params or custom ones
  const paymentStatus = searchParams.get('paymentStatus') || searchParams.get('status');
  const isSuccess = paymentStatus?.toUpperCase() === 'SUCCESS' || paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-in duration-700">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isAr ? 'تمت عملية الدفع بنجاح' : 'Payment Successful'}
            </h1>
            <p className="text-gray-600 mb-8">
              {isAr
                ? 'تم استلام دفعتك بنجاح. يمكنك الآن متابعة حالة طلب الصيانة من لوحة التحكم.'
                : 'Your payment has been received successfully. You can now track your repair request status from the dashboard.'}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-in duration-700">
              <CloseCircle size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isAr ? 'فشلت عملية الدفع' : 'Payment Failed'}
            </h1>
            <p className="text-gray-600 mb-8">
              {isAr
                ? 'عذراً، حدث خطأ أثناء معالجة عملية الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
                : 'Sorry, an error occurred while processing your payment. Please try again or contact support.'}
            </p>
          </>
        )}

        <div className="space-y-3">
          <Link
            href={`/${lang}/dashboard/repairs`}
            className="w-full bg-[#0254ff] text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-600 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            {isAr ? 'الذهاب إلى طلباتي' : 'Go to My Requests'}
            <ArrowLeft size={20} className={isAr ? "" : "rotate-180"} />
          </Link>

          <Link
            href={`/${lang}/dashboard`}
            className="w-full bg-gray-50 text-gray-600 font-bold py-4 px-6 rounded-2xl hover:bg-gray-100 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
          >
            <Home2 size={20} />
            {isAr ? 'الرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-400 font-medium">
        {isAr ? 'شكراً لاستخدامك ريفيا' : 'Thank you for using Revia'}
      </p>
    </div>
  );
}

export default function PaymentStatusPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = React.use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentStatusContent lang={lang} />
    </Suspense>
  );
}
