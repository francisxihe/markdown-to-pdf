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
  options: CanvasOptions = {}
): Promise<HTMLCanvasElement> => {
  // 获取设备像素比，确保在高DPI设备上也能正确渲染
  const devicePixelRatio = window.devicePixelRatio || 1;

  // 计算固定的逻辑尺寸（基于A4纸比例）
  const fixedWidth = 1200; // 固定逻辑宽度
  // 计算固定的逻辑高度（保持元素比例）
  const aspectRatio = element.scrollHeight / element.scrollWidth;
  const fixedHeight = fixedWidth * aspectRatio;

  // 计算实际渲染尺寸（考虑设备像素比和缩放）
  const scale = options.scale || 2;
  const renderScale = scale * devicePixelRatio;

  const defaultOptions: CanvasOptions = {
    scale: renderScale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
    width: fixedWidth,
    height: fixedHeight,
    windowWidth: fixedWidth,
    windowHeight: fixedHeight,
    ...options,
  };

  // 保存原始样式
  const originalStyles = {
    overflow: element.style.overflow,
    height: element.style.height,
    maxHeight: element.style.maxHeight,
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
    width: element.style.width,
    transform: element.style.transform,
    zoom: element.style.zoom,
  };

  // 设置固定的渲染环境，不受页面分辨率影响
  element.style.overflow = "visible";
  element.style.height = "auto";
  element.style.maxHeight = "none";
  element.style.position = "fixed";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.width = `${fixedWidth}px`;
  element.style.transform = "scale(1)";
  element.style.zoom = "1";

  // 强制重新计算布局
  void element.offsetHeight;

  try {
    const canvas = await html2canvas(element, defaultOptions);
    return canvas;
  } finally {
    // 恢复原始样式
    element.style.overflow = originalStyles.overflow;
    element.style.height = originalStyles.height;
    element.style.maxHeight = originalStyles.maxHeight;
    element.style.position = originalStyles.position;
    element.style.left = originalStyles.left;
    element.style.top = originalStyles.top;
    element.style.width = originalStyles.width;
    element.style.transform = originalStyles.transform;
    element.style.zoom = originalStyles.zoom;
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
