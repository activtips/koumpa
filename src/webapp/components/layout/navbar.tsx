'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: 'Fonctionnalites' },
    { href: '#pricing', label: 'Tarifs' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl mt-4 px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-dark-800 rounded-lg p-1.5">
                  <Sparkles className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <span className="text-xl font-bold gradient-text">Koumpa</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-dark-300 hover:text-dark-50 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => logout()}>
                    Deconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onLoginClick}>
                    Connexion
                  </Button>
                  <Button variant="primary" size="sm" onClick={onRegisterClick}>
                    Commencer
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-dark-50"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        className="md:hidden overflow-hidden"
      >
        <div className="mx-4 mt-2 glass rounded-xl p-4 space-y-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-dark-300 hover:text-dark-50 transition-colors font-medium py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-dark-700 space-y-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" size="md" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="md" className="w-full" onClick={() => logout()}>
                  Deconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="md" className="w-full" onClick={onLoginClick}>
                  Connexion
                </Button>
                <Button variant="primary" size="md" className="w-full" onClick={onRegisterClick}>
                  Commencer
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
