import jsPDF from "jspdf";
import type { PDFDimensions } from "../types";

/**
 * 获取A4纸张的标准尺寸
 * @returns PDF尺寸配置
 */
export const getA4Dimensions = (): PDFDimensions => {
  return {
    pageWidth: 210, // A4纸宽度(mm)
    pageHeight: 297, // A4纸高度(mm)
    contentWidth: 210, // 内容区域宽度
    contentHeight: 297, // 内容区域高度
  };
};

/**
 * 创建PDF文档并添加图片内容
 * @param imgData - 图片数据URL
 * @param canvas - Canvas元素（用于计算尺寸）
 * @param dimensions - PDF尺寸配置
 * @returns jsPDF实例
 */
export const createPDFFromImage = (
  imgData: string,
  canvas: HTMLCanvasElement,
  dimensions: PDFDimensions = getA4Dimensions()
): jsPDF => {
  const { contentWidth, contentHeight } = dimensions;
  
  // 计算图片在PDF中的尺寸
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  let heightLeft = imgHeight;

  // 创建PDF文档
  const pdf = new jsPDF("p", "mm", "a4");
  let position = 0;

  // 添加第一页
  pdf.addImage(imgData, "JPEG", 0, 0, contentWidth, imgHeight);
  heightLeft -= contentHeight;

  // 如果内容超过一页，添加更多页面
  while (heightLeft > 0) {
    position -= contentHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, contentWidth, imgHeight);
    heightLeft -= contentHeight;
  }

  return pdf;
};

/**
 * 保存PDF文件
 * @param pdf - jsPDF实例
 * @param filename - 文件名
 */
export const savePDF = (pdf: jsPDF, filename: string): void => {
  pdf.save(filename);
  console.log("PDF生成成功:", filename);
};