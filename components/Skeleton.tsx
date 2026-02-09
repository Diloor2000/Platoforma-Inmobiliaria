'use client';

export const Skeleton = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
};

export const PropertyCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
    <Skeleton className="h-52 w-full rounded-none" />
    <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 6 }: { cols?: number }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-5 w-full" />
      </td>
    ))}
  </tr>
);

export const DashboardSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
    <div className="flex justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-11 w-40 rounded-2xl" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-10 w-48 rounded-2xl" />
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-700/80 dark:bg-slate-900/80">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/80">
          <tr>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={6} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const PropertyDetailSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <Skeleton className="h-4 w-24" />
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-3xl lg:w-96" />
    </div>
  </div>
);
