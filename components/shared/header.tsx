import Link from "next/link";
import Image from "next/image";
import { HeaderAuth } from "@/components/shared/header-auth";
import { MobileNav } from "@/components/shared/mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/img/CV-Edge-Logo.svg" alt="CVEdge" width={100} height={24} priority className="sm:w-[130px]" />
          </Link>
          <HeaderNav />
        </div>
        <div className="hidden md:flex items-center gap-4">
          <HeaderAuth />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function HeaderNav() {
  return (
    <nav className="hidden md:flex items-center gap-5" id="header-nav">
      {/* Links swapped by HeaderAuth client component based on auth state */}
    </nav>
  );
}
