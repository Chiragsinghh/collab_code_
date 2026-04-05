import { useRef, useEffect, useState, useMemo } from "react";
import Editor, { loader } from "@monaco-editor/react";
import useMonacoBinding from "../collaboration/useMonacoBinding";
import useCursorAwareness from "../presence/useCursorAwareness";
import { useEditorStore } from "../../store/useEditorStore";
import { useAppStore } from "../../store/useAppStore";

export default function EditorView() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const modelsRef = useRef({});
  const [activeModel, setActiveModel] = useState(null);
  const activeFileId = useEditorStore((s) => s.activeFileId);

  const appUser = useAppStore((s) => s.user);
  const user = useMemo(() => appUser || { name: "Guest", color: "#ff9249" }, [appUser]);

  // Model synchronization
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFileId) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    let model = modelsRef.current[activeFileId];

    if (!model) {
      const uri = monaco.Uri.parse(`file:///${activeFileId}`);
      model = monaco.editor.createModel("", undefined, uri);
      modelsRef.current[activeFileId] = model;
    }

    editor.setModel(model);
    setActiveModel((prev) => (prev !== model ? model : prev));
  }, [activeFileId]);

  useMonacoBinding(editorRef.current, activeModel, activeFileId);
  useCursorAwareness(editorRef.current, activeFileId, user);

  const handleEditorWillMount = (monaco) => {
    // 🎨 Define the Neon Architect Theme
    monaco.editor.defineTheme("NeonArchitect", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff9249", fontStyle: "bold" },
        { token: "string", foreground: "f9cc61" },
        { token: "number", foreground: "ffcd63" },
        { token: "type", foreground: "8be9fd" },
      ],
      colors: {
        "editor.background": "#0e0e12",
        "editor.lineHighlightBackground": "#ffffff05",
        "editorLineNumber.foreground": "#48474c",
        "editorLineNumber.activeForeground": "#ff9249",
        "editor.selectionBackground": "#ff924933",
        "editorCursor.foreground": "#ff9249",
        "editor.border": "#00000000",
        "editorIndentGuide.background": "#25252b",
        "editorIndentGuide.activeBackground": "#ff924955",
      },
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (activeFileId) {
      let model = modelsRef.current[activeFileId];
      if (!model) {
        const uri = monaco.Uri.parse(`file:///${activeFileId}`);
        model = monaco.editor.createModel("", undefined, uri);
        modelsRef.current[activeFileId] = model;
      }
      editor.setModel(model);
      setActiveModel(model);
    }
  };

  return (
    <div className="h-full bg-[#0e0e12] relative">
      <Editor
        height="100%"
        theme="NeonArchitect"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 13,
          fontFamily: "'Inter', monospace",
          minimap: { enabled: false },
          automaticLayout: true,
          padding: { top: 20, bottom: 20 },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "expand",
          cursorStyle: "line-thin",
          renderLineHighlight: "all",
          scrollbar: {
             vertical: 'visible',
             horizontal: 'visible',
             verticalScrollbarSize: 8,
             horizontalScrollbarSize: 8,
             useShadows: false,
          }
        }}
      />
    </div>
  );
}