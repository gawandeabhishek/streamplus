import { MainNav } from "@/components/layout/main-nav";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { Features } from "@/components/landing/features";

export default function Home() {
  return (
    <>
      <MainNav />
      <Hero />
      <Features />
      <Pricing />
    </>
  );
}
