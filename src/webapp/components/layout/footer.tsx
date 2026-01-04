import Link from 'next/link';
import { Sparkles, Twitter, Github, Linkedin } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Fonctionnalites', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Changelog', href: '/changelog' },
  ],
  company: [
    { label: 'A propos', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carrieres', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Confidentialite', href: '/privacy' },
    { label: 'Conditions', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/koumpa', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/koumpa', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/koumpa', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="border-t border-dark-800 bg-dark-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-dark-800 rounded-lg p-1.5">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-lg font-bold gradient-text">Koumpa</span>
            </Link>
            <p className="text-dark-400 text-sm mb-4">
              Creez des applications web en quelques minutes grace a l&apos;intelligence artificielle.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-50 hover:bg-dark-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-dark-50 mb-3">Produit</h3>
            <ul className="space-y-2">
              {footerLinks.product.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-dark-50 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-dark-50 mb-3">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-dark-50 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-dark-50 mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-dark-50 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-dark-400 text-sm">
            &copy; {new Date().getFullYear()} Koumpa. Tous droits reserves.
          </p>
          <p className="text-dark-500 text-xs">
            Fait avec ❤️ en France
          </p>
        </div>
      </div>
    </footer>
  );
}
