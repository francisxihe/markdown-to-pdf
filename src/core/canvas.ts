import html2canvas from "html2canvas";
import type { CanvasOptions } from "./types";

/**
 * 创建HTML元素的Canvas截图
 * @param element - 要转换的HTML元素
 * @param options - Canvas配置选项
 * @returns Promise<HTMLCanvasElement>
 */
export const createCanvasFromElement = async (
  element: HTMLElement,
  options: CanvasOptions
): Promise<HTMLCanvasElement> => {
  const defaultOptions: CanvasOptions = {
    letterRendering: true,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
    ...options,
  };

  // 强制重新计算布局
  void element.offsetHeight;

  try {
    const canvas = await html2canvas(
      element,
      {
        ...defaultOptions,
      },
    );
    return canvas;
  } catch (error) {
    console.error("创建Canvas失败:", error);
    throw error;
  }
};

/**
 * 将Canvas转换为图片数据URL
 * @param canvas - Canvas元素
 * @param quality - JPEG压缩质量 (0-1)
 * @returns 图片数据URL
 */
export const canvasToDataURL = (
  canvas: HTMLCanvasElement,
  quality: number = 0.85
): string => {
  return canvas.toDataURL("image/jpeg", quality);
};
