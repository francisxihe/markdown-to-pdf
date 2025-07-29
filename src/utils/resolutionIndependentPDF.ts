import type { PDFOptions } from "./types";
import { generatePDF } from "./pdfGenerator";

/**
 * 创建分辨率无关的PDF生成容器
 * @param htmlContent - HTML内容字符串
 * @returns 临时创建的容器元素
 */
const createPDFContainer = (htmlContent: string): HTMLElement => {
  const container = document.createElement('div');
  
  // 设置固定的容器样式，确保在任何分辨率下都保持一致
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    padding: 40px;
    background-color: #ffffff;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333333;
    box-sizing: border-box;
    overflow: visible;
    zoom: 1;
    transform: scale(1);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  `;
  
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  
  // 强制重新计算布局
  void container.offsetHeight;
  
  return container;
};

/**
 * 生成分辨率无关的PDF
 * @param htmlContent - HTML内容字符串
 * @param filename - 文件名
 * @param options - PDF生成选项
 */
export const generateResolutionIndependentPDF = async (
  htmlContent: string,
  filename: string = "document.pdf",
  options: PDFOptions = {}
): Promise<void> => {
  let container: HTMLElement | null = null;
  
  try {
    // 创建独立的PDF容器
    container = createPDFContainer(htmlContent);
    
    // 等待字体和样式加载完成
    await new Promise(resolve => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(resolve);
      } else {
        setTimeout(resolve, 100);
      }
    });
    
    // 再次强制重新计算布局
    void container.offsetHeight;
    
    // 生成PDF
    await generatePDF(container, filename, {
      scale: 2, // 固定缩放比例
      quality: options.quality || 0.85,
      ...options
    });
    
  } finally {
    // 清理临时容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};

/**
 * 从现有元素生成分辨率无关的PDF
 * @param element - 源元素
 * @param filename - 文件名
 * @param options - PDF生成选项
 */
export const generatePDFFromElement = async (
  element: HTMLElement,
  filename: string = "document.pdf",
  options: PDFOptions = {}
): Promise<void> => {
  const htmlContent = element.innerHTML;
  await generateResolutionIndependentPDF(htmlContent, filename, options);
};