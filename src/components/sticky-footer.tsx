"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { IconBrandGithub, IconHome, IconBrandX } from "@tabler/icons-react";

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
          setIsAtBottom(isNearBottom);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="/* base */ /* off-white */ fixed bottom-0 left-0 z-50 h-72 w-full overflow-hidden bg-[#0D0D0D] text-[#F6F6F6] sm:h-80"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,106,0,0.18),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.18]" />

          <div className="relative flex h-full w-full items-start justify-end px-10 py-10 text-right sm:px-12 sm:py-12">
            <motion.div
              className="flex flex-row space-x-10 text-base sm:space-x-16 sm:text-lg md:space-x-24 md:text-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ul className="space-y-2" />
              <ul className="space-y-3">
                <li
                  className="cursor-pointer text-[#EAEAEA] transition-colors hover:text-orange-400"
                  onClick={() =>
                    document.querySelector("#home")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                >
                  <IconHome />
                </li>
                <li
                  className="cursor-pointer text-[#EAEAEA] transition-colors hover:text-orange-400"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_GITHUB_URL}`,
                      "_blank",
                    )
                  }
                >
                  <IconBrandGithub />
                </li>
                <li
                  className="cursor-pointer text-[#EAEAEA] transition-colors hover:text-orange-400"
                  onClick={() =>
                    window.open(`${process.env.NEXT_PUBLIC_X_URL}`, "_blank")
                  }
                >
                  <IconBrandX />
                </li>
              </ul>
            </motion.div>

            <motion.h2
              className="absolute bottom-0 left-0 translate-y-1/3 bg-gradient-to-b from-white via-white/90 to-orange-400/80 bg-clip-text text-[80px] font-extrabold text-transparent drop-shadow-[0_0_20px_rgba(255,106,0,0.15)] select-none sm:text-[144px] md:text-[192px]"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              Spendy
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
