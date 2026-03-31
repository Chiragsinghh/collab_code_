import { useState } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { yjsStore } from "../collaboration/yjsStore";
import * as Y from "yjs";

export default function FileNode({ node }) {
  if (!node) return null;

  const openFile = useEditorStore((s) => s.openFile);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(node.name || "");

  // 🔍 Find Yjs node
  const findYNode = (yNode, id) => {
    if (yNode.get("id") === id) return yNode;

    const children = yNode.get("children");
    if (!children) return null;

    for (let child of children.toArray()) {
      const found = findYNode(child, id);
      if (found) return found;
    }

    return null;
  };

  // 📁 Get root Yjs tree
  const ydoc = yjsStore.doc;
  const yMap = ydoc.getMap("fileTree");
  const root = yMap.get("root");

  // ➕ Add file/folder
  const addNode = (parentId, type) => {
    const parent = findYNode(root, parentId);
    if (!parent) return;

    const newNode = new Y.Map();
    const id = crypto.randomUUID();

    newNode.set("id", id);
    newNode.set("name", type === "file" ? "untitled.js" : "New Folder");
    newNode.set("type", type);
    newNode.set("isExpanded", false);

    if (type === "folder") {
      newNode.set("children", new Y.Array());
    }

    const children = parent.get("children");
    children.push([newNode]);

    // 🔥 create Y.Text for file
    if (type === "file") {
      yjsStore.getOrCreateText(id);
    }
  };

  // ❌ Delete node
  const deleteNode = (id) => {
    const removeNode = (yNode, id) => {
      const children = yNode.get("children");
      if (!children) return false;

      const arr = children.toArray();

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].get("id") === id) {
          children.delete(i, 1);
          return true;
        }

        if (removeNode(arr[i], id)) return true;
      }

      return false;
    };

    removeNode(root, id);
  };

  // ✏️ Rename
  const renameNode = (id, newName) => {
    const target = findYNode(root, id);
    if (!target) return;

    target.set("name", newName);
  };

  // 📂 Toggle folder
  const toggleFolder = (id) => {
    const target = findYNode(root, id);
    if (!target) return;

    const current = target.get("isExpanded");
    target.set("isExpanded", !current);
  };

  const handleRename = () => {
    if (name.trim() === "") return;
    renameNode(node.id, name);
    setIsEditing(false);
  };

  const handleClick = () => {
    if (node.type === "folder") {
      toggleFolder(node.id);
    } else {
      openFile(node.id);
    }
  };

  return (
    <div style={{ marginLeft: 10 }}>
      {/* Node Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          padding: "2px 4px",
        }}
        onClick={handleClick}
      >
        <span>{node.type === "folder" ? "📁" : "📄"}</span>

        {isEditing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            autoFocus
            style={{
              fontSize: 12,
              padding: "2px",
              width: "120px",
            }}
          />
        ) : (
          <span style={{ fontSize: 13 }}>
            {node.name || "untitled"}
          </span>
        )}

        <div
          style={{ display: "flex", gap: 4 }}
          onClick={(e) => e.stopPropagation()}
        >
          {node.type === "folder" && (
            <>
              <button onClick={() => addNode(node.id, "file")}>📄+</button>
              <button onClick={() => addNode(node.id, "folder")}>📁+</button>
            </>
          )}

          {node.id !== "root" && (
            <>
              <button onClick={() => setIsEditing(true)}>✏️</button>
              <button onClick={() => deleteNode(node.id)}>❌</button>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {node.type === "folder" &&
        node.isExpanded &&
        node.children?.map((child) => (
          <FileNode key={child.id} node={child} />
        ))}
    </div>
  );
}