'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Palette,
  Rocket,
  Shield,
  BarChart3,
  Wrench,
  Globe,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const features = [
  {
    icon: Zap,
    title: 'Generation instantanee',
    description: 'Notre IA analyse votre description et genere le code de votre application en quelques secondes.',
    color: 'primary',
  },
  {
    icon: Palette,
    title: 'Design personnalise',
    description: 'Chaque application est unique avec un design moderne et responsive adapte a vos besoins.',
    color: 'secondary',
  },
  {
    icon: Rocket,
    title: 'Deploiement automatique',
    description: 'Votre application est deployee instantanement avec un sous-domaine personnalise.',
    color: 'primary',
  },
  {
    icon: Shield,
    title: 'Securite integree',
    description: 'Authentification, HTTPS et protection des donnees inclus par defaut.',
    color: 'secondary',
  },
  {
    icon: BarChart3,
    title: 'Analytics inclus',
    description: 'Suivez les performances de votre application avec des metriques en temps reel.',
    color: 'primary',
  },
  {
    icon: Wrench,
    title: 'Modifications faciles',
    description: 'Mettez a jour votre application en decrivant simplement les changements souhaites.',
    color: 'secondary',
  },
  {
    icon: Globe,
    title: 'CDN mondial',
    description: 'Vos applications sont distribuees sur un reseau mondial pour des performances optimales.',
    color: 'primary',
  },
  {
    icon: Clock,
    title: 'Support 24/7',
    description: 'Notre equipe est disponible pour vous aider a tout moment.',
    color: 'secondary',
  },
];

const colorStyles = {
  primary: {
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/20',
    icon: 'text-primary-400',
    glow: 'group-hover:shadow-primary-500/20',
  },
  secondary: {
    bg: 'bg-secondary-500/10',
    border: 'border-secondary-500/20',
    icon: 'text-secondary-400',
    glow: 'group-hover:shadow-secondary-500/20',
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-4">
              Fonctionnalites
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-50 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto text-lg">
              Une plateforme complete pour creer, deployer et gerer vos applications web sans effort.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const styles = colorStyles[feature.color as keyof typeof colorStyles];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div
                  className={cn(
                    'h-full p-6 rounded-2xl',
                    'bg-dark-800/50 border border-dark-700',
                    'transition-all duration-300',
                    'hover:bg-dark-800 hover:border-dark-600',
                    'hover:shadow-xl',
                    styles.glow
                  )}
                >
                  <div
                    className={cn(
                      'inline-flex items-center justify-center',
                      'w-12 h-12 rounded-xl mb-4',
                      styles.bg,
                      'border',
                      styles.border
                    )}
                  >
                    <feature.icon className={cn('w-6 h-6', styles.icon)} />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-50 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
