import { Skeleton } from '@/components/ui';

function MetricSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton variant="circular" className="w-4 h-4" />
        <Skeleton className="g-3 w-24" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-2 w-32" />
    </div>
  );
}

export default MetricSkeleton;
