'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartHydrator } from '@/components/cart-hydrator';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={200} skipDelayDuration={0}>
        <CartHydrator />
        {children}
      </TooltipProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
