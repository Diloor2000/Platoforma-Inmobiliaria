import { PropertyDetailSkeleton } from '@/components/Skeleton';

export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-14 w-full animate-pulse rounded-b-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      <PropertyDetailSkeleton />
    </div>
  );
}
