declare module 'pdfobject' {
  interface PDFObjectOptions {
    id?: string;
    page?: number | string;
    height?: string;
    width?: string;
    pdfOpenParams?: Record<string, any>;
    fallbackLink?: boolean | string;
    forcePDFJS?: boolean;
    PDFJS_URL?: string;
    assumptionMode?: boolean;
  }

  export function embed(
    url: string,
    target: HTMLElement | string,
    options?: PDFObjectOptions
  ): boolean;

  export const pdfobjectversion: string;

  export function supportsPDFs(): boolean;

  export default {
    embed,
    pdfobjectversion,
    supportsPDFs
  };
}