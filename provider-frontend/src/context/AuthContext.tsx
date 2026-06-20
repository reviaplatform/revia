'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/profile';
import { Brand } from '@/types/brand';
import { api } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    brand: Brand | null;
    login: (token: string, redirectUrl?: string) => void;
    logout: () => void;
    isLoading: boolean;
    setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [brand, setBrand] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for token on mount
        const checkAuth = async () => {
            const token = localStorage.getItem('providerAccessToken');
            if (token) {
                setIsAuthenticated(true);
                try {
                    // Verify token by fetching user profile and brand
                    const [userRes, brandRes] = await Promise.all([
                        api.get('/me'),
                        api.get('/brand')
                    ]);
                    setUser(userRes.data.data);
                    setBrand(brandRes.data.data);
                } catch (error) {
                    // Token might be invalid or expired
                    console.error('Failed to verify token or fetch brand on load', error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (token: string, redirectUrl: string = '/dashboard') => {
        localStorage.setItem('providerAccessToken', token);
        document.cookie = `providerAccessToken=${token}; path=/; max-age=86400; SameSite=Strict`;
        
        try {
            const [userRes, brandRes] = await Promise.all([
                api.get('/me'),
                api.get('/brand')
            ]);
            setUser(userRes.data.data);
            setBrand(brandRes.data.data);
            setIsAuthenticated(true);
            router.push(redirectUrl);
        } catch (error) {
            console.error('Failed to fetch user profile or brand on login', error);
            // Even if fetch fails, we have the token
            setIsAuthenticated(true);
            router.push(redirectUrl);
        }
    };

    const logout = () => {
        localStorage.removeItem('providerAccessToken');
        document.cookie = `providerAccessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        setIsAuthenticated(false);
        setUser(null);
        setBrand(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, brand, login, logout, isLoading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
