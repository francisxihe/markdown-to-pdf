import { useState, useRef, ChangeEvent } from "react";
import MarkdownIt from "markdown-it";
import {
  generatePaginationPreview,
  generatePDF,
  type PDFOptions,
  type PreviewResult,
} from "./core";
import { handleDownloadCSSTemplate } from "./actions/handleDownloadCSSTemplate";
import { useUploadCss } from "./actions/handleUploadCss";

type QualityLevel = "compact" | "standard" | "high";

interface QualityConfig {
  scale: number;
  quality: number;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const defaultMarkdown = `# Markdown to PDF 示例

这是一个基于 React 和 markdown-it 的 Markdown 转 PDF 工具。

## 功能特性

- ✅ 实时预览 Markdown 内容
- ✅ 支持标准 Markdown 语法
- ✅ 一键导出为 PDF
- ✅ 响应式设计

## 代码示例

\`\`\`javascript
const hello = () => {
  console.log('Hello, World!')
}
\`\`\`

## 表格支持

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 解析 | ✅ | 使用 markdown-it |
| PDF 导出 | ✅ | 使用 jsPDF + html2canvas |
| 实时预览 | ✅ | React 状态管理 |

## 引用

> 这是一个引用示例。Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档。

---

**粗体文本** 和 *斜体文本* 的示例。

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项 A
- 无序列表项 B
- 无序列表项 C
`;

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<QualityLevel>("standard");
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(
    null
  );
  const previewRef = useRef(null);

  const {
    customCSS,
    cssFileName,
    fileInputRef,
    handleCSSFileChange,
    handleClearCSS,
    handleImportCSS,
  } = useUploadCss();

  const handleMarkdownChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      // 根据质量级别设置参数
      const qualityOptions: Record<QualityLevel, QualityConfig> = {
        compact: { scale: 2, quality: 0.85 },
        standard: { scale: 3, quality: 0.9 },
        high: { scale: 3, quality: 0.95 },
      };

      const options: PDFOptions = {
        scale: qualityOptions[quality].scale,
        quality: qualityOptions[quality].quality,
      };

      // 生成分页预览
      const result = await generatePaginationPreview(
        renderedHTML,
        options,
        customCSS
      );

      setPreviewResult(result);
    } catch (error) {
      console.error("预览生成失败:", error);
      alert("预览生成失败，请检查控制台错误信息");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (previewResult) {
      try {
        // 从预览结果重新生成HTML内容
        const htmlContent = previewResult.pages
          .map((page) => page.elements.join(""))
          .join("");

        await generatePDF(
          htmlContent,
          "markdown-document.pdf",
          {
            scale: 2,
            quality: 0.85,
          },
          customCSS
        );
      } catch (error) {
        console.error("PDF下载失败:", error);
        alert("PDF下载失败，请检查控制台错误信息");
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewResult(null);
  };

  const handleClearContent = () => {
    setMarkdown("");
  };

  const handleLoadExample = () => {
    setMarkdown(defaultMarkdown);
  };

  const renderedHTML = md.render(markdown);

  return (
    <div className="container">
      <div className="controls">
        <h1 style={{ margin: 0, fontSize: "24px", color: "#333" }}>
          Markdown to PDF
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <label style={{ fontSize: "14px", color: "#666" }}>
            PDF质量:
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as QualityLevel)}
              style={{
                marginLeft: "8px",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="compact">紧凑 (小文件)</option>
              <option value="standard">标准 (平衡)</option>
              <option value="high">高质量 (大文件)</option>
            </select>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".css"
              onChange={handleCSSFileChange}
              style={{ display: "none" }}
            />
            <button
              className="btn btn-secondary"
              onClick={handleDownloadCSSTemplate}
            >
              下载CSS模板
            </button>
            <button className="btn btn-secondary" onClick={handleImportCSS}>
              导入CSS
            </button>
            {cssFileName && (
              <>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {cssFileName}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={handleClearCSS}
                  style={{ padding: "4px 8px", fontSize: "12px" }}
                >
                  清除
                </button>
              </>
            )}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={handleLoadExample}>
            加载示例
          </button>
          <button className="btn btn-secondary" onClick={handleClearContent}>
            清空内容
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGeneratePDF}
            disabled={isGenerating || !markdown.trim()}
          >
            {isGenerating ? "生成预览中..." : "预览分页"}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-panel">
          <div className="panel-header">Markdown 编辑器</div>
          <textarea
            className="editor"
            value={markdown}
            onChange={handleMarkdownChange}
            placeholder="在这里输入 Markdown 内容..."
          />
        </div>

        <div className="editor-panel">
          <div className="panel-header">实时预览</div>
          <div className="preview markdown-content">
            {customCSS && (
              <style dangerouslySetInnerHTML={{ __html: customCSS }} />
            )}
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </div>
        </div>
      </div>

      {/* 预览模态框 */}
      {previewResult && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>分页预览</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                共 {previewResult.totalPages} 页，确认无误后可下载PDF
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
                maxHeight: "60vh",
                overflow: "auto",
              }}
            >
              {previewResult.pages.map((page) => (
                <div
                  key={page.pageNumber}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    第 {page.pageNumber} 页
                  </div>
                  <canvas
                    ref={(canvas) => {
                      if (canvas && page.canvas) {
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                          canvas.width = page.canvas.width;
                          canvas.height = page.canvas.height;
                          ctx.drawImage(page.canvas, 0, 0);
                        }
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "auto",
                      border: "1px solid #eee",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                onClick={handleClosePreview}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#007bff",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                确认下载 PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
