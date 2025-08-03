/**
 * 创建用于PDF生成的隐藏DOM容器（解决样式问题）
 * @param htmlContent - HTML内容字符串
 * @param customCSS - 自定义CSS样式
 * @returns 创建的隐藏DOM容器
 */
export const createHiddenDOMForPDF = (
  htmlContent: string,
  customCSS?: string
): HTMLElement => {
  const container = document.createElement("div");

  // 设置固定的容器样式，确保在任何分辨率下都保持一致
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1200px;
    padding: 0;
    background-color: #ffffff;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333333;
    box-sizing: border-box;
    overflow: visible;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    white-space: normal;
    word-wrap: break-word;
  `;

  // 添加自定义CSS
  if (customCSS) {
    const styleElement = document.createElement("style");
    styleElement.textContent = customCSS;
    container.appendChild(styleElement);
  }

  // 创建内容容器
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = htmlContent;
  container.appendChild(contentDiv);

  document.body.appendChild(container);

  // 强制重新计算布局
  void container.offsetHeight;

  return container;
};

/**
 * 清理隐藏DOM容器
 * @param container - 要清理的容器元素
 */
export const cleanupHiddenDOM = (container: HTMLElement): void => {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
};
