import { create } from 'zustand';
import { yjsStore } from '../collaboration/yjsStore';

export const useExecutionStore = create((set, get) => ({
  compiledCode: '',
  consoleLogs: [],
  errors: [],
  isRunning: false,

  clearConsole: () => set({ consoleLogs: [], errors: [] }),
  setIsRunning: (status) => set({ isRunning: status }),

  addLog: (logArgs) => {
    set((state) => ({
      consoleLogs: [...state.consoleLogs, logArgs],
    }));
  },

  addError: (errorMsg) => {
    set((state) => ({
      errors: [...state.errors, errorMsg],
    }));
  },

  runCode: () => {
    get().clearConsole();
    get().setIsRunning(true);
  
    const doc = yjsStore.doc;
    if (!doc) {
      get().addError("Y.Doc not initialized.");
      return;
    }
  
    const yMap = doc.getMap("fileTree");
    const root = yMap.get("root");
  
    // 🔍 Traverse all files
    const files = {};
  
    const traverse = (node) => {
      if (!node) return;
  
      if (node.get("type") === "file") {
        const id = node.get("id");
        const name = node.get("name");
  
        const text = yjsStore.getOrCreateText(id);
        files[name] = text ? text.toString() : "";
      }
  
      const children = node.get("children");
      if (children) {
        children.forEach(traverse);
      }
    };
  
    traverse(root);
  
    // 🧠 Extract files
    let htmlContent = files["index.html"] || "";
    const cssContent = files["style.css"] || "";
  
    // 🔥 Collect ALL JS FILES
    let allJS = "";
  
    Object.keys(files).forEach((file) => {
      if (
        file.endsWith(".js") &&
        !file.includes("server") &&
        !file.includes("backend")
      ) {
        let code = files[file];
    
        code = code.replace(/import .* from .*;/g, "");
        code = code.replace(/export default /g, "");
        code = code.replace(/export /g, "");
    
        allJS += `\n// FILE: ${file}\n${code}\n`;
      }
    });
  
    // 🔥 Remove script src from HTML
    htmlContent = htmlContent.replace(
      /<script.*src=.*<\/script>/g,
      ""
    );
  
    // 🚀 FINAL HTML
    const finalHtml = `
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
  
          <script>
            // Console override
            const originalLog = console.log;
            console.log = (...args) => {
              window.parent.postMessage({ type: "console", data: args }, "*");
              originalLog.apply(console, args);
            };
  
            // Error handling
            window.onerror = function(message) {
              window.parent.postMessage({ type: "error", data: message }, "*");
            };
  
            try {
              ${allJS}
            } catch (err) {
              window.parent.postMessage({
                type: "error",
                data: err.message
              }, "*");
            }
          </script>
        </body>
      </html>
    `;
  
    set({ compiledCode: finalHtml });
  
    setTimeout(() => {
      get().setIsRunning(false);
    }, 500);
  }
}));
