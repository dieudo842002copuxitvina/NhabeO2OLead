import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function PriceTickerSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="lg:grid lg:grid-cols-5 lg:gap-3 flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shrink-0 w-[160px] lg:w-auto">
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-3 w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DealerCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NewsCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <CardContent className="p-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
