import { useEffect } from "react";
import * as Y from "yjs";
import { useFileStore } from "../../store/useFileStore";
import { useCollab } from "./CollabProvider";

export default function useFileCollaboration() {
  const { ydoc } = useCollab();
  const setTree = useFileStore((s) => s.setTree);

  useEffect(() => {
    if (!ydoc) return;

    const yMap = ydoc.getMap("fileTree");

    // Important: we seed the root if this is the first time
    if (!yMap.get("root")) {
      const root = new Y.Map();

      root.set("id", "root");
      root.set("name", "root");
      root.set("type", "folder");
      root.set("isExpanded", true);
      root.set("children", new Y.Array());

      yMap.set("root", root);
    }

    const convert = (yNode) => {
      if (!yNode) return null;

      const children = yNode.get("children");

      return {
        id: yNode.get("id"),
        name: yNode.get("name"),
        type: yNode.get("type"),
        isExpanded: yNode.get("isExpanded"),
        children: children ? children.toArray().map(convert) : [],
      };
    };

    const update = () => {
      const root = yMap.get("root");
      if (root) setTree(convert(root));
    };

    // Run first update and then subscribe
    update();
    yMap.observeDeep(update);

    return () => {
      yMap.unobserveDeep(update);
    };
  }, [ydoc, setTree]);
}