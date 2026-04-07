import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <p className="mt-4 text-lg font-medium">Page not found</p>
      <p className="mt-1 text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/dashboard"><Home className="mr-2 h-4 w-4" /> My Resumes</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
