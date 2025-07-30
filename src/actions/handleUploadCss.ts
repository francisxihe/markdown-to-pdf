import { useState, useRef, ChangeEvent } from "react";

export function useUploadCss() {
  const [customCSS, setCustomCSS] = useState<string>("");
  const [cssFileName, setCssFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSSFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/css") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const cssContent = event.target?.result as string;
        setCustomCSS(cssContent);
        setCssFileName(file.name);
      };
      reader.readAsText(file);
    } else if (file) {
      alert("请选择有效的CSS文件");
    }
  };

  const handleClearCSS = () => {
    setCustomCSS("");
    setCssFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportCSS = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    customCSS,
    cssFileName,
    handleCSSFileChange,
    handleClearCSS,
    handleImportCSS,
  };
}
