export interface PDFOptions {
  quality?: number;
  scale?: number;
  showPreview?: boolean; // 是否显示预览容器
  [key: string]: unknown;
}

export interface CanvasOptions {
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  backgroundColor?: string;
  scrollX?: number;
  scrollY?: number;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface PDFDimensions {
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  contentHeight: number;
}