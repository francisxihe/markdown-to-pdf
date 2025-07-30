import type { PDFOptions } from "../core/types";

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
