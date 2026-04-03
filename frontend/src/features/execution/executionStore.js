import { create } from 'zustand';
import { yjsStore } from '../collaboration/yjsStore';

export const useExecutionStore = create((set, get) => ({
  compiledCode: '',
  consoleLogs: [],
  errors: [],

  clearConsole: () => set({ consoleLogs: [], errors: [] }),

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

    const doc = yjsStore.doc;
    if (!doc) {
      get().addError("Y.Doc not initialized.");
      return;
    }

    const yMap = doc.getMap("fileTree");
    const root = yMap.get("root");
    
    // Find file id by name
    const findFileIdByName = (yNode, name) => {
      if (!yNode) return null;
      if (yNode.get("type") === "file" && yNode.get("name") === name) {
        return yNode.get("id");
      }
      const children = yNode.get("children");
      if (children) {
        for (let child of children.toArray()) {
          const found = findFileIdByName(child, name);
          if (found) return found;
        }
      }
      return null;
    };

    const getFileContent = (name) => {
      const id = findFileIdByName(root, name);
      if (!id) return "";
      const text = yjsStore.getOrCreateText(id);
      return text ? text.toString() : "";
    };

    const htmlContent = getFileContent('index.html');
    const cssContent = getFileContent('style.css');
    const jsContent = getFileContent('script.js');

    const finalHtml = `
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>
            // Capture console.log
            const originalLog = console.log;
            console.log = (...args) => {
              window.parent.postMessage({
                type: "console",
                data: args
              }, "*");
              originalLog.apply(console, args);
            };

            // Error handling
            window.onerror = function(message, source, lineno, colno, error) {
              window.parent.postMessage({
                type: "error",
                data: message
              }, "*");
              return false;
            };

            try {
              ${jsContent}
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
  }
}));
