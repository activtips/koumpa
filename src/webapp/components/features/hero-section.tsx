'use client';

import { motion } from 'framer-motion';
import { PromptInput } from './prompt-input';

interface HeroSectionProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function HeroSection({
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 border border-dark-700 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            <span className="text-dark-300">Propulse par</span>
            <span className="font-semibold gradient-text">Claude AI</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-50 mb-6 leading-tight"
        >
          Transformez vos idees en{' '}
          <span className="gradient-text">applications web</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-dark-400 mb-12 max-w-2xl mx-auto"
        >
          Decrivez simplement ce que vous voulez creer. Notre IA genere une application complete et la deploie en quelques secondes.
        </motion.p>

        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PromptInput
            value={prompt}
            onChange={onPromptChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          {[
            { value: '10k+', label: 'Applications creees' },
            { value: '5k+', label: 'Utilisateurs actifs' },
            { value: '99.9%', label: 'Disponibilite' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-dark-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
