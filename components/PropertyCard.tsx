'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Square } from 'lucide-react';
import type { Property } from '@/types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-lg shadow-slate-300/20 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-300/30 dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-950/50 dark:hover:shadow-slate-950/60">
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-52">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-xl bg-white/95 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-md dark:bg-slate-900/95 dark:text-amber-400">
            {property.status}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
              {property.title}
            </h3>
            <span className="shrink-0 text-sm font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(property.price)}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{property.location}</p>
          <div className="mt-1 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-amber-500/80" />
              {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-amber-500/80" />
              {property.baths}
            </span>
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4 text-amber-500/80" />
              {property.sqft} m²
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};
