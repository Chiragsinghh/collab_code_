import { useMemo } from "react";
import { useParams } from "react-router-dom";

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

// ✅ EXECUTION ENGINE
import PreviewPanel from "../features/execution/PreviewPanel";
import { useExecutionStore } from "../features/execution/executionStore";

export default function EditorPage() {
  useFileCollaboration();
  const { id: projectId } = useParams(); // 🔥 Use strictly raw ID to prevent prefix collisions

  const doc = yjsStore.doc;
  const { runCode } = useExecutionStore();

  // ✅ AUTO SAVE HOOK - Uses precise raw ID mappings
  const saveStatus = useAutoSave(doc, projectId);

  // ✅ MANUAL SAVE (STABLE) - Directly invokes global integrated store system
  const handleSave = useMemo(() => {
    return async () => {
      try {
        await yjsStore.saveProjectToDB(projectId);
        console.log("✅ Project saved manually bypassing HTTP overhead.");
      } catch (err) {
        console.error("❌ Save failed:", err);
      }
    };
  }, [projectId]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* 🔥 NAVBAR */}
      <Navbar onSave={handleSave} saveStatus={saveStatus} onRun={runCode} />

      {/* 🔥 MAIN LAYOUT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <FileExplorer />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Tabs />
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 6, minWidth: 0 }}>
              <EditorView />
            </div>
            <div style={{ flex: 4, minWidth: 0, borderLeft: "1px solid #333", backgroundColor: "#fff" }}>
              <PreviewPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}