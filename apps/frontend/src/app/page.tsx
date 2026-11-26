import SiteHeader from '@/components/landing/site-header';
import HeroSection from '@/components/landing/hero-section';
import LandingBackground from '@/components/landing/landing-background';
import FeaturesSection from '@/components/landing/features-section';
import BenefitsSection from '@/components/landing/benefits-section';
import ModulesSection from '@/components/landing/modules-section';
import WhySection from '@/components/landing/why-section';
import FaqSection from '@/components/landing/faq-section';
import LandingFooter from '@/components/landing/landing-footer';

export default function Home() {
  return (
    <>
      <LandingBackground />
      <SiteHeader />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <ModulesSection />
        <WhySection />
        <FaqSection />
        <LandingFooter />
      </main>
    </>
  );
}
