import type { PDFOptions } from "./types";
import { generatePDF } from "./pdfGenerator";

/**
 * 高质量PDF预设配置
 */
export const HIGH_QUALITY_PRESET: PDFOptions = {
  scale: 3,
  quality: 0.95,
  dpi: 300,
  letterRendering: true,
};

/**
 * 标准质量PDF预设配置
 */
export const STANDARD_PRESET: PDFOptions = {
  scale: 2,
  quality: 0.85,
};

/**
 * 紧凑PDF预设配置
 */
export const COMPACT_PRESET: PDFOptions = {
  scale: 1.5,
  quality: 0.7,
};

/**
 * 生成高质量PDF（适用于文本较多的内容）
 * @param element - 要转换的HTML元素
 * @param filename - PDF文件名
 */
export const generateHighQualityPDF = async (
  element: HTMLElement,
  filename: string = "document.pdf"
): Promise<void> => {
  return generatePDF(element, filename, HIGH_QUALITY_PRESET);
};

/**
 * 生成紧凑PDF（文件大小较小）
 * @param element - 要转换的HTML元素
 * @param filename - PDF文件名
 */
export const generateCompactPDF = async (
  element: HTMLElement,
  filename: string = "document.pdf"
): Promise<void> => {
  return generatePDF(element, filename, COMPACT_PRESET);
};

/**
 * 生成标准质量PDF
 * @param element - 要转换的HTML元素
 * @param filename - PDF文件名
 */
export const generateStandardPDF = async (
  element: HTMLElement,
  filename: string = "document.pdf"
): Promise<void> => {
  return generatePDF(element, filename, STANDARD_PRESET);
};