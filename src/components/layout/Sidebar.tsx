'use client';

import { Link, useLocation } from 'react-router-dom';
import { Calculator, Package, Layers, Settings, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    to: '/calculator',
    label: 'Calculator',
    icon: Calculator,
    active: true,
  },
  {
    to: '/filaments',
    label: 'Filaments',
    icon: Layers,
  },
  {
    to: '/products',
    label: 'Products',
    icon: Package,
  },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-white/10 bg-zinc-950 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <Printer className="w-4 h-4 text-black" />
        </div>
        <div>
          <p className="text-base font-semibold text-white leading-tight">3D Print</p>
          <p className="text-sm text-zinc-500 leading-tight">Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, badge }) => {
          const isActive = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-base transition-colors group',
                isActive
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                )}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/10">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-base transition-colors group',
            pathname.startsWith('/settings')
              ? 'bg-amber-500/15 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
          )}
        >
          <Settings className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            pathname.startsWith('/settings') ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
          )} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
