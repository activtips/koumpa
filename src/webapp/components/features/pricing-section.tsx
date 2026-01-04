'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Gratuit',
    description: 'Pour decouvrir la plateforme',
    price: '0€',
    period: 'pour toujours',
    features: [
      '3 applications',
      'Sous-domaine koumpa.com',
      '1 Go de stockage',
      'Support communautaire',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    name: 'Starter',
    description: 'Pour les createurs individuels',
    price: '19€',
    period: '/mois',
    features: [
      '10 applications',
      'Domaine personnalise',
      '10 Go de stockage',
      'Analytics de base',
      'Support par email',
    ],
    cta: 'Essayer Starter',
  },
  {
    name: 'Pro',
    description: 'Pour les professionnels',
    price: '49€',
    period: '/mois',
    features: [
      'Applications illimitees',
      'Domaines personnalises illimites',
      '100 Go de stockage',
      'Analytics avances',
      'Support prioritaire',
      'API access',
      'Collaboration equipe',
    ],
    highlighted: true,
    cta: 'Passer a Pro',
  },
  {
    name: 'Enterprise',
    description: 'Pour les grandes equipes',
    price: 'Sur mesure',
    period: '',
    features: [
      'Tout de Pro',
      'SLA garanti 99.9%',
      'Stockage illimite',
      'Support dedie',
      'Formation personnalisee',
      'Facturation personnalisee',
    ],
    cta: 'Nous contacter',
  },
];

interface PricingSectionProps {
  onSelectPlan: () => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary-500/5 to-transparent rounded-full blur-3xl" />
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
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-500/10 border border-secondary-500/20 text-secondary-400 text-sm font-medium mb-4">
              Tarifs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-50 mb-4">
              Un prix simple et transparent
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto text-lg">
              Commencez gratuitement et evoluez selon vos besoins.
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl p-6',
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary-500/10 to-secondary-500/10 border-2 border-primary-500/30'
                  : 'bg-dark-800/50 border border-dark-700'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-dark-50 mb-1">
                  {plan.name}
                </h3>
                <p className="text-dark-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-dark-50">{plan.price}</span>
                <span className="text-dark-400">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'primary' : 'outline'}
                size="md"
                className="w-full"
                onClick={onSelectPlan}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
