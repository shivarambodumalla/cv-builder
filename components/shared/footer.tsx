import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center">
              <img src="/img/CV-Edge-Logo.svg" alt="CVEdge" className="h-7" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your CV, your edge.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/upload-resume" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Upload Resume</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-muted-foreground sm:text-right">
            <p>&copy; {new Date().getFullYear()} CVEdge</p>
            <p className="mt-1">Made with love for job seekers</p>
            <a href="mailto:hello@thecvedge.com" className="mt-1 inline-block hover:text-foreground transition-colors">
              hello@thecvedge.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
