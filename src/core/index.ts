// 类型定义
import type { PDFOptions } from "./types";

// 分辨率无关PDF生成功能
import {} from "./dom/createDom";
import { createHiddenDOMForPDF, cleanupHiddenDOM } from "./dom/createDom";

// 智能分页PDF生成功能
import { SmartPagination, PreviewResult } from "./smartPagination";

/**
 * 生成智能分页PDF的便捷函数（直接下载）
 */
export const generatePDF = async (
  htmlContent: string,
  filename: string = "document.pdf",
  options: PDFOptions = {},
  customCSS?: string
): Promise<void> => {
  const paginator = new SmartPagination();
  await paginator.generatePDF(htmlContent, filename, options, customCSS);
};

/**
 * 生成分页预览的便捷函数
 * 先通过createHiddenDOMForPDF生成隐藏DOM（解决样式问题），然后进行分页处理
 */
export const generatePaginationPreview = async (
  htmlContent: string,
  options: PDFOptions = {},
  customCSS?: string
): Promise<PreviewResult> => {
  let hiddenDOM: HTMLElement | null = null;

  try {
    // 1. 先创建隐藏DOM来解决样式问题
    hiddenDOM = createHiddenDOMForPDF(htmlContent, customCSS);

    // 等待字体和样式加载完成
    await new Promise((resolve) => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(resolve);
      } else {
        setTimeout(resolve, 100);
      }
    });

    // 强制重新计算布局
    void hiddenDOM.offsetHeight;

    // 2. 从隐藏DOM获取处理后的HTML内容
    const processedHTML = hiddenDOM.innerHTML;

    // 3. 使用处理后的HTML进行分页预览
    const paginator = new SmartPagination();
    return await paginator.generatePreview(processedHTML, options, customCSS);
  } finally {
    // 4. 清理隐藏DOM
    if (hiddenDOM) {
      cleanupHiddenDOM(hiddenDOM);
    }
  }
};
