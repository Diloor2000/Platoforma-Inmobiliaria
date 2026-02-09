import { PropertyCardSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-14 w-full animate-pulse rounded-b-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-6 w-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      </div>
    </div>
  );
}
