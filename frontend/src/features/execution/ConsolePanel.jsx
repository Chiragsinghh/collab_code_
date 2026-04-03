import { useExecutionStore } from "./executionStore";

export default function ConsolePanel() {
  const { consoleLogs, errors, clearConsole } = useExecutionStore();

  return (
    <div style={{ padding: "10px", backgroundColor: "#1e1e1e", color: "#d4d4d4", flex: 1, overflowY: "auto", borderTop: "1px solid #333", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexShrink: 0 }}>
        <h4 style={{ margin: 0, fontSize: "14px", color: "#ccc", fontWeight: "600" }}>Console</h4>
        <button onClick={clearConsole} style={{ background: "none", border: "1px solid #555", color: "#ccc", cursor: "pointer", fontSize: "12px", borderRadius: "4px", padding: "2px 8px" }}>Clear</button>
      </div>

      <div style={{ fontSize: "13px", fontFamily: "monospace", flex: 1, overflowY: "auto" }}>
        {errors.map((err, i) => (
          <div key={`err-${i}`} style={{ color: "#f48771", padding: "4px 0", borderBottom: "1px solid #333" }}>
            ❌ {err}
          </div>
        ))}
        {consoleLogs.map((log, i) => (
          <div key={`log-${i}`} style={{ padding: "4px 0", borderBottom: "1px solid #333", color: "#9cdcfe" }}>
            › {log.map(item => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(" ")}
          </div>
        ))}
        {errors.length === 0 && consoleLogs.length === 0 && (
          <div style={{ color: "#666", fontStyle: "italic", marginTop: "10px" }}>No output</div>
        )}
      </div>
    </div>
  );
}
