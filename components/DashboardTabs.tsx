'use client';

import Link from 'next/link';
import { LayoutDashboard, CalendarDays, MessageSquare, Users, Package } from 'lucide-react';

const tabs = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, href: '#resumen' },
  { id: 'citas', label: 'Citas', icon: CalendarDays, href: '#citas' },
  { id: 'leads', label: 'Leads', icon: MessageSquare, href: '#leads' },
  { id: 'gestion-asesores', label: 'Gestión de Asesores', icon: Users, href: '#gestion-asesores' },
  { id: 'inventario', label: 'Inventario', icon: Package, href: '#inventario' },
];

export const DashboardTabs = () => {
  return (
    <nav
      className="sticky top-14 z-40 -mx-4 mb-6 flex overflow-x-auto border-b border-slate-200/80 bg-slate-50/95 px-4 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      aria-label="Secciones del panel"
    >
      <div className="flex gap-1 py-2">
        {tabs.map(({ id, label, icon: Icon, href }) => (
          <Link
            key={id}
            href={href}
            className="flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
