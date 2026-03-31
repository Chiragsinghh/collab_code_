import { useEffect, useRef } from "react";
import { yjsStore } from "./yjsStore";

export default function useAwareness({ editor, activeFileId, user }) {
  const decorationsRef = useRef([]);

  useEffect(() => {
    if (!editor || !activeFileId || !user) return;

    const awareness = yjsStore.provider?.awareness;
    if (!awareness) return;

    // 1. Set local user locally over Yjs mesh network
    awareness.setLocalStateField("user", user);

    // 2. Track cursor dynamically and export it per explicit fileId location
    const updateCursor = () => {
      const position = editor.getPosition();
      if (position) {
        awareness.setLocalStateField("customCursor", {
          fileId: activeFileId,
          position,
        });
      }
    };

    // Broadcast explicitly when modifying selection
    const disposable = editor.onDidChangeCursorPosition(updateCursor);
    updateCursor(); 

    // 3. Loop network clients whenever presence updates
    const renderDecorations = () => {
      const states = Array.from(awareness.getStates().entries());
      const localId = awareness.clientID;

      const newDecorations = [];

      for (const [clientId, state] of states) {
        if (clientId === localId) continue;

        const { customCursor, user: remoteUser } = state;
        
        // Limit rendering to cursor matching the physical screen tab
        if (!customCursor || customCursor.fileId !== activeFileId) {
          continue;
        }

        const { position } = customCursor;
        if (!position || !remoteUser) continue;

        const name = remoteUser.name || "Anonymous";

        // Generate Decoration block securely mapping against Monaco's internal options list
        newDecorations.push({
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          options: {
            className: "remote-cursor",
            hoverMessage: { value: name },
            beforeContentClassName: "remote-cursor-label",
            stickiness: 1, // TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        });
      }

      // Render decorations delta directly overriding old references mapped via ref array
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    };

    awareness.on("change", renderDecorations);
    renderDecorations();

    return () => {
      disposable.dispose();
      awareness.off("change", renderDecorations);
      
      // Withdraw explicitly on unmount logic
      awareness.setLocalStateField("customCursor", null);
      if (editor) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [editor, activeFileId, user]);
}
