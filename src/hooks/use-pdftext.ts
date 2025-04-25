"use client";
import { useEffect, useState, useRef } from "react";
import * as PDFJS from "pdfjs-dist/types/src/pdf";

export const usePDFJS = (
  onLoad?: (pdfjs: typeof PDFJS) => Promise<void>,
  deps: (string | number | boolean | undefined | null)[] = [],
) => {
  const ourPDF = useRef<typeof PDFJS | null>(null);

  // load the library once on mount (the webpack import automatically sets-up the worker)
  useEffect(() => {
    void import("pdfjs-dist/webpack.mjs").then((pdfjs) => {
      ourPDF.current = pdfjs;
    });
  }, []);

  // execute the callback function whenever PDFJS loads (or a custom dependency-array updates)
  useEffect(() => {
    const pdfJs = ourPDF.current
    if (!pdfJs || !onLoad) return;
    void (async () => await onLoad(pdfJs))();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoad, ourPDF.current, ...deps]);

  return ourPDF;
};