'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

type AuthMode = 'login' | 'register' | 'confirm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  pendingPrompt?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'register',
  pendingPrompt,
}: AuthModalProps) {
  const { login, register, confirmRegistration } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        const result = await register(email, password, name);
        if (result.needsConfirmation) {
          setMode('confirm');
        } else {
          onClose();
        }
      } else if (mode === 'confirm') {
        await confirmRegistration(email, confirmationCode);
        await login(email, password);
        onClose();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-700 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="px-8 pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-dark-50 mb-2">
                  {mode === 'login' && 'Bon retour !'}
                  {mode === 'register' && 'Creez votre compte'}
                  {mode === 'confirm' && 'Verifiez votre email'}
                </h2>
                <p className="text-dark-400">
                  {mode === 'login' && 'Connectez-vous pour continuer'}
                  {mode === 'register' && 'Commencez a creer des applications'}
                  {mode === 'confirm' && `Un code a ete envoye a ${email}`}
                </p>

                {pendingPrompt && mode !== 'confirm' && (
                  <div className="mt-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                    <p className="text-sm text-primary-300">
                      Connectez-vous pour generer : &quot;{pendingPrompt.slice(0, 50)}...&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                {mode === 'confirm' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <Input
                        type="text"
                        placeholder="Code de verification"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                        className="pl-11"
                        autoFocus
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {mode === 'register' && (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <Input
                          type="text"
                          placeholder="Votre nom"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-11"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11"
                        autoFocus={mode === 'login'}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <Input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {mode === 'login' && 'Se connecter'}
                  {mode === 'register' && 'Creer mon compte'}
                  {mode === 'confirm' && 'Verifier'}
                </Button>

                {/* Mode switcher */}
                {mode !== 'confirm' && (
                  <p className="text-center text-dark-400 text-sm">
                    {mode === 'login' ? (
                      <>
                        Pas encore de compte ?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('register')}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          Inscrivez-vous
                        </button>
                      </>
                    ) : (
                      <>
                        Deja un compte ?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('login')}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          Connectez-vous
                        </button>
                      </>
                    )}
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
