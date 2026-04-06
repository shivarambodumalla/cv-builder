import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex justify-center"><Skeleton className="h-8 w-24" /></div>
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
