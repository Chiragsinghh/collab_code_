import { useEffect, useRef } from "react";
import { useExecutionStore } from "./executionStore";
import ConsolePanel from "./ConsolePanel";

export default function PreviewPanel() {
  const { compiledCode, addLog, addError } = useExecutionStore();
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      // Ensure the message has our expected structure
      if (typeof event.data === "object" && event.data !== null) {
        if (event.data.type === "console") {
          addLog(event.data.data);
        } else if (event.data.type === "error") {
          addError(event.data.data);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addLog, addError]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", borderLeft: "1px solid #2d2d2d", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#f5f5f5" }}>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Preview</span>
      </div>
      
      <div style={{ flex: 2, position: "relative", backgroundColor: "#ffffff" }}>
        <iframe
          ref={iframeRef}
          title="preview"
          sandbox="allow-scripts allow-same-origin allow-modals"
          srcDoc={compiledCode}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      
      <ConsolePanel />
    </div>
  );
}
