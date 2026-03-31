import { useMemo } from "react";

import FileExplorer from "../features/filesystem/FileExplorer";
import Tabs from "../features/editor/Tabs";
import EditorView from "../features/editor/EditorView";
import useFileCollaboration from "../features/collaboration/useFileCollaboration";

import Navbar from "../components/Navbar";
import { exportProject } from "../utils/exportProject";
import axios from "axios";
import { yjsStore } from "../features/collaboration/yjsStore";

// ✅ AUTO-SAVE
import { useAutoSave } from "../features/autosave/useAutoSave";

export default function EditorPage() {
  useFileCollaboration();

  const doc = yjsStore.doc;
  const projectId = yjsStore.roomId;

  // ✅ AUTO SAVE HOOK
  const saveStatus = useAutoSave(doc, projectId);

  // ✅ MANUAL SAVE (STABLE)
  const handleSave = useMemo(() => {
    return async () => {
      try {
        const data = exportProject(doc);

        await axios.post(
          `http://localhost:5001/project/${projectId}/save`,
          data
        );

        console.log("✅ Project saved");
      } catch (err) {
        console.error("❌ Save failed:", err);
      }
    };
  }, [doc, projectId]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* 🔥 NAVBAR */}
      <Navbar onSave={handleSave} saveStatus={saveStatus} />

      {/* 🔥 MAIN LAYOUT */}
      <div style={{ display: "flex", flex: 1 }}>
        <FileExplorer />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Tabs />
          <div style={{ flex: 1 }}>
            <EditorView />
          </div>
        </div>
      </div>
    </div>
  );
}