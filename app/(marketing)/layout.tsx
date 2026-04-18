import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { AnonPageTracker } from "@/components/shared/anon-page-tracker";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AnonPageTracker />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
