import Link from "next/link";
import Image from "next/image";
import { HeaderAuth } from "@/components/shared/header-auth";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/img/CV-Edge-Logo.svg" alt="CVedge" width={130} height={30} priority />
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <HeaderAuth />
        </nav>
      </div>
    </header>
  );
}
