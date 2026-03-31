import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import useMonacoBinding from "../collaboration/useMonacoBinding";
import useAwareness from "../collaboration/useAwareness";
import { useEditorStore } from "../../store/useEditorStore";
import { useAppStore } from "../../store/useAppStore";

export default function EditorView() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Model-per-file system caching mechanism
  const modelsRef = useRef({});
  const [activeModel, setActiveModel] = useState(null);
  const activeFileId = useEditorStore((s) => s.activeFileId);

  // App User details for live cursors
  const user = useAppStore((s) => s.user) || { name: "Guest", color: "#eacc22" };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFileId) return;

    const editor = editorRef.current;
    
    // Acquire a previously generated cached model from reference otherwise build anew
    let model = modelsRef.current[activeFileId];

    if (!model) {
      model = monacoRef.current.editor.createModel(
        "", 
        undefined, 
        monacoRef.current.Uri.parse(`file:///${activeFileId}`)
      );
      modelsRef.current[activeFileId] = model;
    }

    editor.setModel(model);
    setActiveModel(model);

  }, [activeFileId]);

  // Use the refined Monaco handler keeping YText syncing independently scoped to file instances
  useMonacoBinding(editorRef.current, activeModel, activeFileId);

  // Phase 7: Enable LIVE cursors via completely decoupled observer explicitly bound to internal Monaco events
  useAwareness({
    editor: editorRef.current,
    activeFileId,
    user
  });

  return (
    <Editor
      height="100vh"
      theme="vs-dark"
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Perform primary bootstrap of models resolving startup racing conditions.
        if (activeFileId) {
          let model = modelsRef.current[activeFileId];
          if (!model) {
            model = monaco.editor.createModel(
              "", 
              undefined, 
              monaco.Uri.parse(`file:///${activeFileId}`)
            );
            modelsRef.current[activeFileId] = model;
          }
          editor.setModel(model);
          setActiveModel(model);
        }
      }}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}