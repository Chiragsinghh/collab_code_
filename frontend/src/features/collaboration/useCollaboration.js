import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

export default function useCollaboration(monaco, editor, fileId) {
  const providerRef = useRef(null);
  const docRef = useRef(null);
  const bindingRef = useRef(null);

  useEffect(() => {
    if (!monaco || !editor || !fileId) return;

    // 🧠 Create Yjs document
    const ydoc = new Y.Doc();

    // 🌐 Connect to WebSocket server
    const provider = new WebsocketProvider(
      "ws://localhost:1234", // your Yjs server
      `file-${fileId}`,      // room per file
      ydoc
    );

    const yText = ydoc.getText("monaco");

    // 🔗 Bind Monaco with Yjs
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // Save refs
    docRef.current = ydoc;
    providerRef.current = provider;
    bindingRef.current = binding;

    return () => {
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [monaco, editor, fileId]);
}