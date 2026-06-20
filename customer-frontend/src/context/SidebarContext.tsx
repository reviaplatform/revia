"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  isMobileOpen: boolean;
  toggleExpanded: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on window resize if it gets larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ 
      isExpanded, 
      isMobileOpen, 
      toggleExpanded, 
      toggleMobile, 
      closeMobile 
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
