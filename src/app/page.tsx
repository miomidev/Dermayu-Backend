import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { ShowcaseBanner } from "@/components/landing/ShowcaseBanner";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaBanner } from "@/components/landing/CtaBanner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#132422] flex flex-col justify-between selection:bg-[#38746D] selection:text-white">
      <SiteHeader path="/" />
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Stats Bar */}
        <StatsBar />

        {/* 3. Showcase Banner (Pantauan Real-Time Peta Indramayu) */}
        <ShowcaseBanner />

        {/* 4. Features Section (2x2 Grid Highlighted Features) */}
        <FeaturesSection />

        {/* 5. Why Us Section (4 Columns) */}
        <WhyUsSection />

        {/* 6. FAQ Section (2-Column dengan Subscribe Form) */}
        <FaqSection />

        {/* 7. Bottom CTA Banner (CTA Heading + Mulai Sekarang) */}
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
