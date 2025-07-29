import type { PDFOptions } from "./types";
import { createCanvasFromElement, canvasToDataURL } from "./canvasUtils";
import { createPDFFromImage, savePDF, getA4Dimensions } from "./pdfUtils";

/**
 * 将HTML元素转换为PDF
 * @param element - 要转换的HTML元素
 * @param filename - PDF文件名
 * @param options - 配置选项
 */
export const generatePDF = async (
  element: HTMLElement,
  filename: string = "document.pdf",
  options: PDFOptions = {}
): Promise<void> => {
  // 提取质量设置和Canvas选项
  const { quality = 0.85, ...canvasOptions } = options;

  try {
    // 创建Canvas截图
    const canvas = await createCanvasFromElement(element, canvasOptions);
    
    // 转换为图片数据
    const imgData = canvasToDataURL(canvas, quality);
    
    // 创建PDF文档
    const dimensions = getA4Dimensions();
    const pdf = createPDFFromImage(imgData, canvas, dimensions);
    
    // 保存PDF文件
    savePDF(pdf, filename);
  } catch (error) {
    console.error("PDF生成失败:", error);
    throw error;
  }
};

// 导出预设配置和便捷函数
export {
  generateHighQualityPDF,
  generateCompactPDF,
  generateStandardPDF,
  HIGH_QUALITY_PRESET,
  STANDARD_PRESET,
  COMPACT_PRESET,
} from "./presets";

// 导出类型定义
export type { PDFOptions, CanvasOptions, PDFDimensions } from "./types";

// 导出工具函数
export { createCanvasFromElement, canvasToDataURL } from "./canvasUtils";
export { createPDFFromImage, savePDF, getA4Dimensions } from "./pdfUtils";
