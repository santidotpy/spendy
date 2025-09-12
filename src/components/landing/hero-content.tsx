"use client";
import { cn } from "~/lib/utils";
import { Spotlight } from "~/components/ui/spotlight";
import { Highlight } from "~/components/ui/hero-highlight";

export default function HeroContent() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden rounded-md bg-black/[0.96] antialiased md:items-center md:justify-center">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />

      <Spotlight
        className="xs:left-10 top-1 left-1 md:-top-20 md:left-60 lg:-top-40 lg:left-150"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text pb-3 text-center text-4xl font-bold text-transparent md:text-7xl">
          Spendy
        </h1>
        <h2 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text pb-3 text-center text-2xl font-bold text-transparent md:text-5xl">
          the best way to track {""}
          <Highlight className="text-black dark:text-white">
            your spending.
          </Highlight>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          Spendy helps you track, categorize, and visualize your expenses with
          ease. Clear insights and smart reminders keep you in control of your
          money.
        </p>
      </div>
    </div>
  );
}
