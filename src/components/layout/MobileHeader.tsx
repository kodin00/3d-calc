'use client';

import { Link, useLocation } from 'react-router-dom';
import { Calculator, Package, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/calculator', label: 'Calc', icon: Calculator },
  { to: '/products', label: 'Products', icon: Package },
];

export function MobileHeader() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden flex items-center gap-2 px-4 h-14 border-b border-white/10 bg-zinc-950 sticky top-0 z-50">
        <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
          <Printer className="w-4 h-4 text-black" />
        </div>
        <span className="font-semibold text-sm text-white">3D Print Mgmt</span>
      </header>

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-zinc-950">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                isActive ? 'text-amber-400' : 'text-zinc-500'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
