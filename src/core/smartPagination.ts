import jsPDF from "jspdf";
import type { PDFOptions } from "./types";
import { createCanvasFromElement } from "./canvas";
import { createHiddenDOMForPDF, cleanupHiddenDOM } from "./dom/createDom";

export interface PagePreview {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  elements: string[];
}

export interface PreviewResult {
  pages: PagePreview[];
  totalPages: number;
  pdf: jsPDF;
}

/**
 * 智能分页PDF生成
 * 通过分析HTML内容结构，在合适的位置进行分页，避免切断文本行
 */
export class SmartPagination {
  private pdf: jsPDF;
  private pageWidth: number = 210; // A4宽度(mm)
  private pageHeight: number = 297; // A4高度(mm)
  private margin: number = 20; // 固定页边距
  private contentWidth: number;
  private contentHeight: number;
  private currentY: number = 0;

  constructor() {
    this.pdf = new jsPDF("p", "mm", "a4");
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.contentHeight = this.pageHeight - 2 * this.margin;
  }

  /**
   * 生成分页预览
   * @param htmlContent - HTML内容字符串
   * @param options - PDF选项
   */
  async generatePreview(
    htmlContent: string,
    options: PDFOptions = {},
    customCSS?: string
  ): Promise<PreviewResult> {
    // 重置状态
    this.pdf = new jsPDF("p", "mm", "a4");
    this.currentY = 0;

    const pages: PagePreview[] = [];
    let currentPageElements: string[] = [];

    // 创建临时容器
    const container = this.createContainer(htmlContent, false, customCSS);

    try {
      // 获取所有可分页的元素
      const elements = this.getPageableElements(container);

      // 逐个处理元素并智能分页
      for (const element of elements) {
        const elementHeight = await this.calculateElementHeight(
          element,
          options,
          customCSS
        );

        // 检查是否需要分页
        if (
          this.currentY + elementHeight > this.contentHeight &&
          currentPageElements.length > 0
        ) {
          // 生成当前页的预览
          const pageCanvas = await this.generatePageCanvas(
            currentPageElements,
            options,
            customCSS
          );
          pages.push({
            pageNumber: pages.length + 1,
            canvas: pageCanvas,
            elements: [...currentPageElements],
          });

          // 开始新页
          this.addNewPage();
          currentPageElements = [];
        }

        // 添加元素到当前页
        currentPageElements.push(element.outerHTML);
        this.currentY += elementHeight;
      }

      // 处理最后一页
      if (currentPageElements.length > 0) {
        const pageCanvas = await this.generatePageCanvas(
          currentPageElements,
          options,
          customCSS
        );
        pages.push({
          pageNumber: pages.length + 1,
          canvas: pageCanvas,
          elements: [...currentPageElements],
        });
      }

      return {
        pages,
        totalPages: pages.length,
        pdf: this.pdf,
      };
    } finally {
      // 清理临时容器
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  /**
   * 生成智能分页PDF（使用统一的标准化容器）
   * @param htmlContent - HTML内容字符串
   * @param filename - 文件名
   * @param options - PDF选项
   */
  async generatePDF(
    htmlContent: string,
    filename: string,
    options: PDFOptions = {},
    customCSS?: string
  ): Promise<void> {
    let hiddenDOM: HTMLElement | null = null;

    try {
      // 1. 使用统一的标准化容器创建方法
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

      // 2. 从标准化容器获取处理后的HTML内容
      const processedHTML = hiddenDOM.innerHTML;

      // 3. 创建用于分页的临时容器
      const container = this.createContainer(processedHTML, false, customCSS);

      try {
        // 获取所有可分页的元素
        const elements = this.getPageableElements(container);

        // 处理每个元素
        for (const element of elements) {
          await this.processElement(element, options, customCSS);
        }

        // 保存PDF
        this.pdf.save(filename);
      } finally {
        // 清理分页容器
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    } finally {
      // 4. 清理标准化容器
      if (hiddenDOM) {
        cleanupHiddenDOM(hiddenDOM);
      }
    }
  }

  /**
   * 创建临时容器
   * @param htmlContent - HTML内容
   * @param showPreview - 是否显示预览
   * @param customCSS - 自定义CSS样式
   */
  private createContainer(
    htmlContent: string,
    showPreview?: boolean,
    customCSS?: string
  ): HTMLElement {
    const container = document.createElement("div");

    if (showPreview) {
      // 预览模式：显示在页面上
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: ${this.contentWidth * 3.78}px;
        max-height: 80vh;
        padding: 20px;
        margin: 0;
        background-color: #ffffff;
        border: 2px solid #007acc;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333333;
        box-sizing: border-box;
        overflow: auto;
        z-index: 9999;
      `;

      // 添加预览标题
      const title = document.createElement("div");
      title.style.cssText = `
        position: sticky;
        top: 0;
        background-color: #007acc;
        color: white;
        padding: 8px 12px;
        margin: -20px -20px 20px -20px;
        font-weight: bold;
        font-size: 12px;
        border-radius: 6px 6px 0 0;
      `;
      title.textContent = "PDF 分页预览";
      container.appendChild(title);
    } else {
      // 正常模式：隐藏在页面外
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${this.contentWidth * 3.78}px;
        padding: 0;
        margin: 0;
        background-color: #ffffff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333333;
        box-sizing: border-box;
        overflow: visible;
      `;
    }

    // 创建内容容器
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = htmlContent;

    // 如果有自定义CSS，添加到容器中
    if (customCSS) {
      const styleElement = document.createElement("style");
      styleElement.textContent = customCSS;
      container.appendChild(styleElement);
    }

    container.appendChild(contentDiv);

    document.body.appendChild(container);

    // 强制重新计算布局
    void container.offsetHeight;

    return container;
  }

  /**
   * 获取可分页的元素列表
   */
  private getPageableElements(container: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          // 选择块级元素作为分页单位
          if (
            [
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "p",
              "div",
              "blockquote",
              "pre",
              "ul",
              "ol",
              "table",
              "hr",
            ].includes(tagName)
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }

          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    let node = walker.nextNode();
    while (node) {
      elements.push(node as HTMLElement);
      node = walker.nextNode();
    }

    return elements;
  }

  /**
   * 处理单个元素
   */
  private async processElement(
    element: HTMLElement,
    options: PDFOptions,
    customCSS?: string
  ): Promise<void> {
    // 创建元素的独立容器
    const elementContainer = this.createElementContainer(
      element,
      options.showPreview,
      customCSS
    );

    try {
      // 生成元素的Canvas
      const canvas = await createCanvasFromElement(elementContainer, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: elementContainer.scrollWidth,
        height: elementContainer.scrollHeight,
      });

      // 计算元素在PDF中的高度
      const elementHeight = (canvas.height * this.contentWidth) / canvas.width;

      // 检查是否需要分页
      if (this.currentY + elementHeight > this.contentHeight) {
        this.addNewPage();
      }

      // 添加元素到PDF
      const imgData = canvas.toDataURL("image/jpeg", options.quality || 0.85);
      this.pdf.addImage(
        imgData,
        "JPEG",
        this.margin,
        this.margin + this.currentY,
        this.contentWidth,
        elementHeight
      );

      this.currentY += elementHeight;
    } finally {
      // 清理临时容器（如果不是预览模式）
      if (!options.showPreview && elementContainer.parentNode) {
        elementContainer.parentNode.removeChild(elementContainer);
      }
    }
  }

  /**
   * 为单个元素创建容器
   * @param element - 要处理的元素
   * @param showPreview - 是否显示预览
   * @param customCSS - 自定义CSS样式
   */
  private createElementContainer(
    element: HTMLElement,
    showPreview?: boolean,
    customCSS?: string
  ): HTMLElement {
    const container = document.createElement("div");

    if (showPreview) {
      // 预览模式：在主预览容器旁边显示当前处理的元素
      container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: ${this.contentWidth * 2}px;
        max-height: 40vh;
        padding: 15px;
        margin: 0;
        background-color: #f8f9fa;
        border: 2px solid #28a745;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333333;
        box-sizing: border-box;
        overflow: auto;
        z-index: 10000;
      `;

      // 添加当前处理元素的标题
      const title = document.createElement("div");
      title.style.cssText = `
        position: sticky;
        top: 0;
        background-color: #28a745;
        color: white;
        padding: 6px 10px;
        margin: -15px -15px 15px -15px;
        font-weight: bold;
        font-size: 11px;
        border-radius: 6px 6px 0 0;
      `;
      title.textContent = `正在处理: ${element.tagName.toLowerCase()}`;
      container.appendChild(title);
    } else {
      // 正常模式：隐藏在页面外
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${this.contentWidth * 3.78}px;
        padding: 0;
        margin: 0;
        background-color: #ffffff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333333;
        box-sizing: border-box;
        overflow: visible;
      `;
    }

    // 如果有自定义CSS，添加到容器中
    if (customCSS) {
      const styleElement = document.createElement("style");
      styleElement.textContent = customCSS;
      container.appendChild(styleElement);
    }

    // 克隆元素内容
    container.appendChild(element.cloneNode(true));
    document.body.appendChild(container);

    // 强制重新计算布局
    void container.offsetHeight;

    return container;
  }

  /**
   * 计算元素高度
   */
  private async calculateElementHeight(
    element: HTMLElement,
    options: PDFOptions,
    customCSS?: string
  ): Promise<number> {
    const elementContainer = this.createElementContainer(
      element,
      false,
      customCSS
    );

    try {
      const canvas = await createCanvasFromElement(elementContainer, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: elementContainer.scrollWidth,
        height: elementContainer.scrollHeight,
      });

      return (canvas.height * this.contentWidth) / canvas.width;
    } finally {
      if (elementContainer.parentNode) {
        elementContainer.parentNode.removeChild(elementContainer);
      }
    }
  }

  /**
   * 生成页面Canvas
   */
  private async generatePageCanvas(
    elements: string[],
    options: PDFOptions,
    customCSS?: string
  ): Promise<HTMLCanvasElement> {
    const pageContainer = document.createElement("div");
    pageContainer.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: ${this.contentWidth * 3.78}px;
      padding: 0;
      margin: 0;
      background-color: #ffffff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333333;
      box-sizing: border-box;
      overflow: visible;
    `;

    pageContainer.innerHTML = elements.join("");

    // 如果有自定义CSS，添加到页面容器中
    if (customCSS) {
      const styleElement = document.createElement("style");
      styleElement.textContent = customCSS;
      pageContainer.appendChild(styleElement);
    }

    document.body.appendChild(pageContainer);

    try {
      void pageContainer.offsetHeight;

      const canvas = await createCanvasFromElement(pageContainer, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: pageContainer.scrollWidth,
        height: pageContainer.scrollHeight,
      });

      return canvas;
    } finally {
      if (pageContainer.parentNode) {
        pageContainer.parentNode.removeChild(pageContainer);
      }
    }
  }

  /**
   * 添加新页面
   */
  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = 0;
  }
}

