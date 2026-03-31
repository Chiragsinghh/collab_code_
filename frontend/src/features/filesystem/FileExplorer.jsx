import { useFileStore } from "../../store/useFileStore";
import FileNode from "./FileNode";

export default function FileExplorer() {
  const tree = useFileStore((state) => state.tree);

  // 🛑 Wait for CRDT sync
  if (!tree) {
    return (
      <div
        style={{
          width: 250,
          background: "#1e1e1e",
          color: "white",
          padding: 10,
          height: "100%",
        }}
      >
        Loading files...
      </div>
    );
  }

  // 🛑 Safety: root must exist
  if (!tree.id) {
    return (
      <div
        style={{
          width: 250,
          background: "#1e1e1e",
          color: "red",
          padding: 10,
          height: "100%",
        }}
      >
        Invalid file tree
      </div>
    );
  }

  return (
    <div
      style={{
        width: 250,
        background: "#1e1e1e",
        color: "white",
        height: "100%",
        overflowY: "auto",
        borderRight: "1px solid #333",
      }}
    >
      <FileNode node={tree} />
    </div>
  );
}