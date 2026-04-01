import { useRef, useEffect, useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import useMonacoBinding from "../collaboration/useMonacoBinding";
import useCursorAwareness from "../presence/useCursorAwareness";
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
  const appUser = useAppStore((s) => s.user);
  const user = useMemo(() => appUser || { name: "Guest", color: "#eacc22" }, [appUser]);

  // Sync activeFileId with the Monaco editor model
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFileId) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    // Acquire a previously generated cached model from reference otherwise build anew
    let model = modelsRef.current[activeFileId];

    if (!model) {
      // Create a unique URI for Monaco to distinguish models
      const uri = monaco.Uri.parse(`file:///${activeFileId}`);
      model = monaco.editor.createModel("", undefined, uri);
      modelsRef.current[activeFileId] = model;
    }

    // Set the editor to use the cached model and update React state
    // so `useMonacoBinding` triggers.
    editor.setModel(model);
    
    // Only set state if the model actually changed to avoid re-render loops
    setActiveModel((prev) => (prev !== model ? model : prev));

  }, [activeFileId]);

  // Use the refined Monaco handler keeping YText syncing independently scoped to file instances
  useMonacoBinding(editorRef.current, activeModel, activeFileId);

  // Enable LIVE cursors via completely decoupled observer explicitly bound to internal Monaco events
  useCursorAwareness(editorRef.current, activeFileId, user);

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
            const uri = monaco.Uri.parse(`file:///${activeFileId}`);
            model = monaco.editor.createModel("", undefined, uri);
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