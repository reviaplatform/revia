"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '../lib/api/types';
import { apiClient, setAccessToken as setAxiosToken, onSessionUpdate } from '../lib/api/client';
import { refreshToken } from '../lib/api/auth';
import { getProfile } from '../lib/api/profile';


export type AuthStep = 'PHONE_ENTRY' | 'OTP_ENTRY' | 'REGISTER_FORM' | 'DONE';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  setSession: (accessToken: string, expiresIn: number, refreshToken?: string, user?: User) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (step?: AuthStep) => void;
  closeAuthModal: () => void;
  authModalStep: AuthStep;
  setAuthModalStep: (step: AuthStep) => void;
}

const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: 'mock-token',
    user: { 
      id: 'mock-id', 
      name: 'Ahmed Developer', 
      phoneNumber: '01001234567', 
      gender: 'male', 
      email: 'ahmed@example.com', 
      birthday: '1995-01-01', 
      languagePreference: 'en',
      createdAt: new Date().toISOString()
    },
    isLoading: false,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState<AuthStep>('PHONE_ENTRY');

  const openAuthModal = (step: AuthStep = 'PHONE_ENTRY') => {
    setAuthModalStep(step);
    setIsAuthModalOpen(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('auth', 'required');
      window.history.pushState(null, '', url.pathname + url.search);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      const newSearch = url.search ? url.search : '';
      window.history.pushState(null, '', url.pathname + newSearch);
    }
  };
  
  // Tracks if the initial session verification has settled ('PENDING' -> 'PASS' | 'FAIL')
  const [sessionCheckResult, setSessionCheckResult] = useState<'PENDING' | 'PASS' | 'FAIL'>('PASS');

  const router = useRouter();
  const pathname = usePathname();

  // Redirect if session is lost while on a dashboard route
  useEffect(() => {
    const isDashboard = pathname.includes('/dashboard');
    if (isDashboard && sessionCheckResult === 'FAIL' && !state.isLoading) {
      console.warn('🚪 AuthContext: Session definitively lost, redirecting...');
      const lang = pathname.split('/')[1] || 'ar';
      router.push(`/${lang}?auth=expired`);
    }
  }, [state.isLoading, sessionCheckResult, pathname, router]);


  const setSession = (accessToken: string, expiresIn: number, refreshToken?: string, user?: User) => {
    const finalAccessToken = accessToken;
    const finalRefreshToken = refreshToken;

    console.log('🔐 AuthContext: Setting session...', { 
      hasAccessToken: !!finalAccessToken,
      accessTokenPreview: finalAccessToken?.substring(0, 8),
      hasRefreshToken: !!finalRefreshToken,
      refreshTokenPreview: finalRefreshToken?.substring(0, 8)
    });
    setAxiosToken(finalAccessToken);
    
    if (finalRefreshToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', finalRefreshToken);
        setCookie('refreshToken', finalRefreshToken); // Sync with middleware
        console.log('💾 AuthContext: Saved refreshToken to localStorage & Cookies');
      }
    } else {
      console.warn('⚠️ AuthContext: No refreshToken received during setSession!');
    }

    setState(prev => ({
      ...prev,
      accessToken,
      user: user || prev.user, // Don't clear user if not provided
      isLoading: false,
    }));
    
    // Explicitly mark as PASS if we have a token
    setSessionCheckResult('PASS');
  };

  const logout = () => {
    setAxiosToken(null);
    deleteCookie('refreshToken');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
    setState({
      accessToken: null,
      user: null,
      isLoading: false,
    });
    setSessionCheckResult('FAIL');
  };

  useEffect(() => {
    // Sync React state with axios interceptor refreshes
    const unsubscribe = onSessionUpdate((token: string | null, rotateRefresh?: string | null) => {
      console.log('🔄 AuthContext: Session update received. Token present:', !!token);
      
      if (rotateRefresh) {
        setCookie('refreshToken', rotateRefresh);
      } else if (token === null) {
        deleteCookie('refreshToken');
      }

      setSessionCheckResult(token ? 'PASS' : 'FAIL');
      setState(prev => ({ 
        ...prev, 
        accessToken: token,
        // Clear user if token is null
        user: token ? prev.user : null
      }));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Attempt to settle session on boot. 
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    
    if (!storedToken) {
      console.log('ℹ️ AuthContext: No refreshToken found, treating as guest');
      setSessionCheckResult('FAIL');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    console.log('⏳ AuthContext: Mount - Settling session...');
    setState(prev => ({ ...prev, isLoading: true }));
    
    getProfile()
      .then((userData) => {
        console.log('✅ AuthContext: Initial session check passed');
        setState(prev => ({ ...prev, user: userData }));
        setSessionCheckResult('PASS');
      })
      .catch((err) => {
        console.log('ℹ️ AuthContext: Initial session check resolved (expired or invalid)');
        setSessionCheckResult('FAIL');
      })
      .finally(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      setSession, 
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      authModalStep,
      setAuthModalStep
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
