import { Skeleton } from '@/components/ui';

function WorkflowSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      <div className="flex gap-2 mt-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export default WorkflowSkeleton;
