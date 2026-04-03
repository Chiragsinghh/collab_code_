import { useEffect, useRef, useState } from "react";
import { yjsStore } from "../collaboration/yjsStore";

const AUTOSAVE_DELAY = 1500; // 1.5s debounce strictly fulfilling architecture reqs

export const useAutoSave = (doc, projectId) => {
  const timerRef = useRef(null);
  const isSavingRef = useRef(false);

  const [status, setStatus] = useState("Saved"); // "Saving..." | "Saved" | "Error saving"

  useEffect(() => {
    if (!doc || !projectId) return;

    const handleUpdate = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        if (isSavingRef.current) return;

        try {
          isSavingRef.current = true;
          setStatus("Saving...");

          // Synchronous fully compatible CRDT binary encoding integration to Mongo
          await yjsStore.saveProjectToDB(projectId);

          console.log("💾 Yjs Auto-saved pure CRDT state at", new Date().toLocaleTimeString());
          setStatus("Saved");
        } catch (err) {
          console.error("Auto-save failed:", err);
          setStatus("Error saving");
        } finally {
          isSavingRef.current = false;
        }
      }, AUTOSAVE_DELAY);
    };

    // ✅ Listen strictly to granular CRDT update pulses natively
    doc.on("update", handleUpdate);

    return () => {
      doc.off("update", handleUpdate);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [doc, projectId]);

  return status;
};