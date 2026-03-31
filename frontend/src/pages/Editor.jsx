import FileExplorer from "../features/filesystem/FileExplorer";
import Tabs from "../features/editor/Tabs";
import EditorView from "../features/editor/EditorView";

// ✅ ADD THIS
import useFileCollaboration from "../features/collaboration/useFileCollaboration";

export default function EditorPage() {
  // 🔥 THIS IS REQUIRED
  useFileCollaboration();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <FileExplorer />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Tabs />
        <div style={{ flex: 1 }}>
          <EditorView />
        </div>
      </div>
    </div>
  );
}