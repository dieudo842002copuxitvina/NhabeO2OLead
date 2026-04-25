import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-6">
      <div className="container">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <Skeleton className="aspect-video rounded-[2rem] w-full" />
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-12 w-3/4" />
              <div className="flex items-baseline gap-3">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <Skeleton className="h-32 rounded-[2rem] w-full" />
            
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 rounded-3xl w-full" />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Skeleton className="h-[400px] rounded-[2.5rem] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
