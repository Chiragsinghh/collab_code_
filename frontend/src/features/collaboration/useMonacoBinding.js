import { useEffect, useRef } from "react";
import { MonacoBinding } from "y-monaco";
import { yjsStore } from "./yjsStore";

export default function useMonacoBinding(editor, model, fileId) {
  const bindingRef = useRef(null);

  useEffect(() => {
    if (!editor || !model || !fileId) return;

    // Retrieve unique text representation from the single YDoc instance mapping to fileId
    const yText = yjsStore.getOrCreateText(fileId);

    // 🔥 Initial sync: Load Y.Text right away if Monaco Editor Model hasn't been instantiated with it yet.
    if (model.getValue() === "") {
      const existingText = yText.toString();
      if (existingText) {
        model.setValue(existingText);
      }
    }

    // Always clear prior binding completely internally to Y.js before reconnecting 
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    // Create the updated binding tracking exact modifications
    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      yjsStore.provider.awareness
    );

    bindingRef.current = binding;

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [editor, model, fileId]);
}