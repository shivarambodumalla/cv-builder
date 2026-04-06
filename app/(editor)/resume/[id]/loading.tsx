import { Skeleton } from "@/components/ui/skeleton";

export default function EditorLoading() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center border-b px-3 gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-6 w-48" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-full lg:w-[40%] border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/30 p-6">
          <Skeleton className="w-[595px] h-[842px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
