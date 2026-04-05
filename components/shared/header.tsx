import Link from "next/link";
import Image from "next/image";
import { HeaderAuth } from "@/components/shared/header-auth";
import { MobileNav } from "@/components/shared/mobile-nav";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/img/CV-Edge-Logo.svg" alt="CVedge" width={100} height={24} priority className="sm:w-[130px]" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <HeaderAuth />
        </nav>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
