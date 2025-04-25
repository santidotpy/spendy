// // utils/pdf-extract.ts


// GlobalWorkerOptions.workerSrc = workerSrc;


// // GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

// export async function extractTextWithPdfjs(buffer: Buffer): Promise<string> {
//   const loadingTask = getDocument({ data: buffer });
//   const pdf = await loadingTask.promise;

//   const numPages = pdf.numPages;
//   let fullText = '';

//   for (let pageNum = 1; pageNum <= numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum);
//     const content = await page.getTextContent();

//     const strings = content.items.map((item: any) => item.str);
//     fullText += strings.join(' ') + '\n\n';
//   }

//   return fullText;
// }


// utils/pdf-extract.ts
// import pdfParse from "pdf-parse";
import { Buffer } from "buffer";

// export async function extractTextFromPdfBase64(base64: string): Promise<string> {
//   const buffer = Buffer.from(base64, "base64");
//   const { text } = await pdfParse(buffer);
//   return text;
// }

export function formatCurrency(amount: number, withDollarSign = true): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return withDollarSign ? `$${formatted}` : formatted;
}