'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/features/hero-section';
import { FeaturesSection } from '@/components/features/features-section';
import { PricingSection } from '@/components/features/pricing-section';
import { AuthModal } from '@/components/features/auth-modal';
import { useAuth } from '@/lib/auth/auth-context';
import { usePrompt } from '@/lib/hooks/use-prompt';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    prompt,
    setPrompt,
    isGenerating,
    result,
    handleSubmit,
    clearResult,
  } = usePrompt();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Redirect to workspace when generation starts
  useEffect(() => {
    if (result?.projectId) {
      router.push(`/workspace/${result.projectId}`);
      clearResult();
    }
  }, [result, router, clearResult]);

  const handlePromptSubmit = async () => {
    // If not authenticated, show auth modal
    if (!isAuthenticated) {
      setPendingPrompt(prompt);
      setIsAuthModalOpen(true);
      return;
    }

    // Otherwise, submit the prompt
    await handleSubmit();
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    setPendingPrompt(null);
  };

  const handleSelectPlan = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />

      <main>
        <HeroSection
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handlePromptSubmit}
          isLoading={isGenerating}
        />

        <FeaturesSection />

        <PricingSection onSelectPlan={handleSelectPlan} />
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        pendingPrompt={pendingPrompt || undefined}
      />
    </div>
  );
}
