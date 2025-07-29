// 主要PDF生成功能
export { generatePDF } from "./pdfGenerator";

// 预设配置和便捷函数
export {
  generateHighQualityPDF,
  generateCompactPDF,
  generateStandardPDF,
  HIGH_QUALITY_PRESET,
  STANDARD_PRESET,
  COMPACT_PRESET,
} from "./presets";

// 类型定义
export type { PDFOptions, CanvasOptions, PDFDimensions } from "./types";

// 工具函数（可选导出，用于高级用法）
export { createCanvasFromElement, canvasToDataURL } from "./canvasUtils";
export { createPDFFromImage, savePDF, getA4Dimensions } from "./pdfUtils";

// 分辨率无关PDF生成功能
export * from "./resolutionIndependentPDF";

// 智能分页PDF生成功能
export * from "./smartPagination";