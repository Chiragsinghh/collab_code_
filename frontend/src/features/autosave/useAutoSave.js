import { useEffect, useRef, useState } from "react";
import { exportProject } from "../collaboration/exportProject"; // adjust path if needed
import axios from "axios";

const AUTOSAVE_DELAY = 3000; // 3 seconds

export const useAutoSave = (doc, projectId) => {
  const timerRef = useRef(null);
  const lastSavedSnapshotRef = useRef(null);
  const isSavingRef = useRef(false);

  const [status, setStatus] = useState("Saved"); // "Saving..." | "Saved"

  useEffect(() => {
    if (!doc || !projectId) return;

    const handleUpdate = () => {
      // Reset debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        if (isSavingRef.current) return;

        try {
          const snapshot = exportProject(doc);
          const snapshotString = JSON.stringify(snapshot);

          // 🚫 Prevent redundant saves
          if (snapshotString === lastSavedSnapshotRef.current) {
            return;
          }

          isSavingRef.current = true;
          setStatus("Saving...");

          await axios.post(
            `http://localhost:5001/project/${projectId}/save`,
            snapshot
          );

          console.log("💾 Auto-saved at", new Date().toLocaleTimeString());

          lastSavedSnapshotRef.current = snapshotString;
          setStatus("Saved");
        } catch (err) {
          console.error("Auto-save failed:", err);
        } finally {
          isSavingRef.current = false;
        }
      }, AUTOSAVE_DELAY);
    };

    // ✅ Listen to Yjs updates
    doc.on("update", handleUpdate);

    return () => {
      // ✅ Cleanup (CRITICAL)
      doc.off("update", handleUpdate);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [doc, projectId]);

  return status;
};