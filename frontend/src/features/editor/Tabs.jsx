import { useEditorStore } from "../../store/useEditorStore";
import { useFileStore } from "../../store/useFileStore";

export default function Tabs() {
  const { openTabs, activeFileId, setActiveFile, closeFile } =
    useEditorStore();

  const getFileById = useFileStore((s) => s.getFileById);

  return (
    <div style={{ display: "flex", background: "#2d2d2d" }}>
      {openTabs.map((id) => {
        const file = getFileById(id);

        return (
          <div
            key={id}
            onClick={() => setActiveFile(id)}
            style={{
              padding: "5px 10px",
              background: activeFileId === id ? "#1e1e1e" : "#2d2d2d",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {file?.name}
            <span onClick={(e) => {
              e.stopPropagation();
              closeFile(id);
            }}>
              ❌
            </span>
          </div>
        );
      })}
    </div>
  );
}