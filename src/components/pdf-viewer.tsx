'use client';

import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ScrollArea } from './ui/scroll-area';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};
const resizeObserverOptions = {};
const maxWidth = 1400;

type PDFFile = string | File | null | undefined;

export default function PDFViewer({
  file,
  onLoadSuccess,
  className,
  hidePageNumbers = false,
}: {
  file: PDFFile;
  onLoadSuccess?: () => void;
  className?: string;
  hidePageNumbers?: boolean;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  if (!file) return null;

  return (
    <ScrollArea
      className={`border-gray h-[600px] w-full rounded-lg border-2 ${className}`}
      ref={setContainerRef}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          onLoadSuccess?.();
        }}
        options={options}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={index}
            className="border-gray border-b"
            pageNumber={index + 1}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
          >
            {!hidePageNumbers && (
              <div className="text-center text-sm text-gray-500">
                Página {index + 1} de {numPages}
              </div>
            )}
          </Page>
        ))}
      </Document>
    </ScrollArea>
  );
}