import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { PricingSection } from "@/components/PricingSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <PricingSection />

      <footer className="border-t py-12 bg-muted/20">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 VistaLock. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
