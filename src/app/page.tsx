"use client";

import { NavbarDemo } from "~/components/landing/navbar";
import HeroContent from "~/components/landing/hero-content";
import { BentoGridDemo } from "~/components/landing/bento";
import { StickyFooter } from "~/components/sticky-footer";

export default function HomePage() {
  return (
    <div>
      <NavbarDemo />
      <section id="home">
        {" "}
        <HeroContent />
      </section>

      <section id="features">
        <h2 className="m-10 text-center text-4xl font-bold">Features</h2>
        <BentoGridDemo />
      </section>

      <section id="footer" className="mt-90">
        <StickyFooter />
      </section>
    </div>
  );
}
