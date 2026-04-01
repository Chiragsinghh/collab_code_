import { useEffect, useRef } from "react";
import { MonacoBinding } from "y-monaco";
import { yjsStore } from "./yjsStore";

export default function useMonacoBinding(editor, model, fileId) {
  const bindingRef = useRef(null);

  useEffect(() => {
    // We only create a binding when all three dependencies are stable
    if (!editor || !model || !fileId || !yjsStore.provider) return;

    // Destroy any existing binding before creating a new one
    // This prevents echoing characters and backwards typing loops.
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    // Isolate Y.Text to this specific file
    const yText = yjsStore.getOrCreateText(fileId);

    // Bind this file's Y.Text to the uniquely cached Monaco model
    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      yjsStore.provider.awareness // Share awareness (cursors)
    );

    bindingRef.current = binding;

    return () => {
      // The crucial cleanup block: remove the binding when the file switches or component unmounts
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [editor, model, fileId]);
}