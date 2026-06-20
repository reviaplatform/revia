"use client";

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';
import RegisterStep from './RegisterStep';
import { useAuth, AuthStep } from '@/context/AuthContext';

function AuthModalContent() {
  const { isAuthModalOpen: isOpen, openAuthModal, closeAuthModal, authModalStep: step, setAuthModalStep: setStep } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const langMatch = pathname.match(/^\/(en|ar)(\/|$)/);
  const lang = (langMatch ? langMatch[1] : 'en') as "en" | "ar";

  const [shouldRender, setShouldRender] = useState(false);
  
  // State to pass between steps
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [registerToken, setRegisterToken] = useState<string | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync URL "?auth=required" param with local context state on initial load / navigation
  useEffect(() => {
    if (searchParams.get('auth') === 'required' && !isOpen) {
      openAuthModal('PHONE_ENTRY');
    }
  }, [searchParams, isOpen, openAuthModal]);

  useGSAP(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      // Outro
      const tl = gsap.timeline({
        onComplete: () => setShouldRender(false)
      });
      tl.to(backdropRef.current, { opacity: 0, duration: 0.2 })
        .to(modalRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.2 }, "<");
    }
  }, [isOpen]);

  // Intro animation when shouldRender becomes true
  useGSAP(() => {
    if (shouldRender && isOpen) {
      const tl = gsap.timeline();
      tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(modalRef.current, 
          { opacity: 0, scale: 0.95, y: 10 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }, 
          "-=0.2"
        );
    }
  }, [shouldRender, isOpen]);

  const performNavigation = (targetPath: string) => {
    console.log('✅ Authentication successful. Finalizing session before redirect to:', targetPath);
    closeAuthModal();
    
    console.log('🚀 Redirecting via window.location.href to:', targetPath);
    window.location.href = targetPath;

    // Reset state after a delay if the page hasn't reloaded yet (safety)
    setTimeout(() => {
      setStep('PHONE_ENTRY');
      setPhoneNumber('');
      setIsExistingUser(null);
      setRegisterToken(null);
    }, 1000);
  };

  const closeModal = () => {
    closeAuthModal();
    setTimeout(() => {
      setStep('PHONE_ENTRY');
      setPhoneNumber('');
      setIsExistingUser(null);
      setRegisterToken(null);
    }, 300);
  };

  const handlePhoneSuccess = (phone: string, existing: boolean) => {
    setPhoneNumber(phone);
    setIsExistingUser(existing);
    setStep('OTP_ENTRY');
  };

  const handleOtpSuccess = (payload?: { registerToken: string }) => {
    console.log('OTP Success Payload:', payload);
    if (payload?.registerToken) {
      // New user
      setRegisterToken(payload.registerToken);
      setStep('REGISTER_FORM');
    } else {
      // Existing user: logged in
      console.log('Existing user login success, redirecting to dashboard...');
      performNavigation(`/${lang}/dashboard`);
    }
  };

  const handleRegisterSuccess = () => {
    console.log('Registration success event received');
    // New user successfully registered and token is in context
    performNavigation(`/${lang}/dashboard`);
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={closeModal}
      />
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-md p-10 relative z-10 border border-border"
      >
        <div className="flex justify-center mb-6">
          <div className="relative h-10 w-32">
            <Image
              src="/revia.png"
              alt="Revia Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-3xl font-black mb-8 text-center text-foreground tracking-tight leading-[1.04]">
          {step === 'PHONE_ENTRY' && (lang === 'ar' ? 'ابدأ بإصلاح جهازك' : 'Start Your Device Repair')}
          {step === 'OTP_ENTRY' && (lang === 'ar' ? 'أدخل رمز التحقق' : 'Enter Verification Code')}
          {step === 'REGISTER_FORM' && (lang === 'ar' ? 'أكمل التسجيل' : 'Complete Registration')}
        </h2>

        <div>
          {step === 'PHONE_ENTRY' && (
            <PhoneStep 
              lang={lang} 
              onSuccess={handlePhoneSuccess} 
            />
          )}
          {step === 'OTP_ENTRY' && (
            <OtpStep 
              lang={lang} 
              phoneNumber={phoneNumber} 
              isExistingUser={isExistingUser}
              onSuccess={handleOtpSuccess} 
              onBack={() => setStep('PHONE_ENTRY')}
            />
          )}
          {step === 'REGISTER_FORM' && registerToken && (
            <RegisterStep 
              lang={lang} 
              registerToken={registerToken} 
              onSuccess={handleRegisterSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalContent />
    </Suspense>
  );
}
