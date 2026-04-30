import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Skeleton className="h-9 w-52 rounded-full" />
          <Skeleton className="mt-5 h-12 w-full max-w-3xl rounded-2xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-4xl rounded-full" />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <Skeleton className="h-8 w-64 rounded-full" />
          <div className="mt-5 flex flex-wrap gap-3">
            <Skeleton className="h-14 w-40 rounded-2xl" />
            <Skeleton className="h-14 w-40 rounded-2xl" />
            <Skeleton className="h-14 w-40 rounded-2xl" />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <Skeleton className="h-7 w-56 rounded-full" />
          <Skeleton className="mt-5 h-[320px] w-full rounded-[24px] sm:h-[380px]" />
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <Skeleton className="h-7 w-64 rounded-full" />
          <Skeleton className="mt-5 h-[260px] w-full rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
