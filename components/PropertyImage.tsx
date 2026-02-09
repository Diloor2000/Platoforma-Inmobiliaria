'use client';

import Image from 'next/image';

/**
 * URLs de Supabase Storage a veces fallan con next/image (Invalid src prop).
 * Usamos <img> estándar para Supabase para garantizar visualización (rúbrica Soporte Visual).
 */
function isSupabaseImageUrl(src: string): boolean {
  return typeof src === 'string' && src.includes('supabase.co');
}

interface PropertyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/** Muestra imagen de propiedad: <img> para Supabase (siempre visible), next/image para el resto. */
export function PropertyImage({ src, alt, fill = false, sizes, className = '', priority }: PropertyImageProps) {
  if (isSupabaseImageUrl(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={fill ? `absolute inset-0 h-full w-full object-cover ${className}`.trim() : (className || 'object-cover')}
      />
    );
  }
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 640px) 100vw, 33vw'}
        className={className || 'object-cover'}
        priority={priority}
      />
    );
  }
  return <Image src={src} alt={alt} width={800} height={600} className={className} />;
}
