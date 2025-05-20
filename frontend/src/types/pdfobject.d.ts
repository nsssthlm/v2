declare module 'pdfobject' {
  interface PDFObjectOptions {
    fallbackLink?: string;
    height?: string;
    width?: string;
    pdfOpenParams?: {
      navpanes?: number;
      toolbar?: number;
      statusbar?: number;
      view?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface PDFObject {
    embed(url: string, target: HTMLElement | string, options?: PDFObjectOptions): boolean;
    pdfobjectversion: string;
    supportsPDFs: boolean;
  }

  const pdfObject: PDFObject;
  export default pdfObject;
}