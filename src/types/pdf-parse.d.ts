declare module 'pdf-parse' {
    import { Buffer } from 'buffer';
  
    interface PDFMetadata {
      version: string;
      metadata: any;
      info: any;
    }
  
    interface PDFParseResult {
      numpages: number;
      numrender: number;
      info: any;
      metadata: any;
      version: string;
      text: string;
    }
  
    type PDFData = Buffer | Uint8Array | string;
  
    export default function pdfParse(dataBuffer: PDFData): Promise<PDFParseResult>;
  }
  

  declare module "pdfjs-dist/webpack.mjs" {
    export * from "pdfjs-dist";
  }