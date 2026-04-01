import { useEffect, useRef } from "react";
import { usePresenceStore } from "./presenceStore";
import { yjsStore } from "../collaboration/yjsStore";

// Simple throttle to avoid external dependencies
function throttle(func, wait) {
  let timeout = null;
  let previous = 0;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

export default function useCursorAwareness(editor, activeFileId, user) {
  const decorationsRef = useRef([]);

  useEffect(() => {
    if (!editor || !activeFileId || !yjsStore.provider) return;

    const awareness = yjsStore.provider.awareness;

    // Immediately set the user local state and file context
    if (user) {
      usePresenceStore.getState().setLocalUser(user);
    }
    awareness.setLocalStateField("fileId", activeFileId);

    // Initialize subscriber logic strictly from store
    const unsubscribe = usePresenceStore.getState().subscribeToAwareness();

    const updateDecorations = () => {
      const states = awareness.getStates();
      const newDecorations = [];

      states.forEach((state, clientId) => {
        if (clientId === awareness.clientID) return; // Skip ourselves
        if (state.fileId !== activeFileId) return; // Must be in the same file
        if (!state.user || !state.cursor) return; // Must have valid presence data

        const { user: remoteUser, cursor } = state;
        const color = remoteUser.color || "#ff0000";

        // Setup dynamic styles per user if they don't exist
        const className = `yjs-cursor-${clientId}`;
        let styleNode = document.getElementById(className);
        if (!styleNode) {
          styleNode = document.createElement("style");
          styleNode.id = className;
          styleNode.innerHTML = `
            .${className}-cursor {
              border-left: 2px solid ${color};
              position: relative;
              z-index: 10;
            }
            .${className}-cursor::after {
              content: "${remoteUser.name || 'Anonymous'}";
              position: absolute;
              top: -18px;
              left: 0;
              background-color: ${color};
              color: white;
              font-size: 10px;
              padding: 2px 4px;
              white-space: nowrap;
              border-radius: 2px;
              pointer-events: none;
            }
            .${className}-selection {
              background-color: ${color}40;
            }
          `;
          document.head.appendChild(styleNode);
        }

        const isSelection = cursor.anchor && cursor.head && 
          (cursor.anchor.lineNumber !== cursor.head.lineNumber || cursor.anchor.column !== cursor.head.column);
          
        if (isSelection) {
          const anchorIsFirst = 
            cursor.anchor.lineNumber < cursor.head.lineNumber || 
            (cursor.anchor.lineNumber === cursor.head.lineNumber && cursor.anchor.column < cursor.head.column);

          newDecorations.push({
            range: {
              startLineNumber: anchorIsFirst ? cursor.anchor.lineNumber : cursor.head.lineNumber,
              startColumn: anchorIsFirst ? cursor.anchor.column : cursor.head.column,
              endLineNumber: anchorIsFirst ? cursor.head.lineNumber : cursor.anchor.lineNumber,
              endColumn: anchorIsFirst ? cursor.head.column : cursor.anchor.column
            },
            options: {
              className: `${className}-selection`,
            }
          });
        }

        // The cursor line itself
        newDecorations.push({
          range: {
            startLineNumber: cursor.head.lineNumber,
            startColumn: cursor.head.column,
            endLineNumber: cursor.head.lineNumber,
            endColumn: cursor.head.column
          },
          options: {
            className: `${className}-cursor`
          }
        });
      });

      // Apply the decorations onto the Monaco editor instance non-reactively
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    };

    awareness.on("change", updateDecorations);

    const handleCursorChange = throttle(() => {
      const selection = editor.getSelection();
      if (!selection) return;

      usePresenceStore.getState().updateCursor({
        anchor: {
          lineNumber: selection.selectionStartLineNumber,
          column: selection.selectionStartColumn
        },
        head: {
          lineNumber: selection.positionLineNumber,
          column: selection.positionColumn
        }
      });
    }, 50);

    const cursorListener = editor.onDidChangeCursorPosition(handleCursorChange);
    const selectionListener = editor.onDidChangeCursorSelection(handleCursorChange);

    // Initial render for cursors that are already present
    updateDecorations();

    return () => {
      // Clean up decorations
      if (editor) {
          editor.deltaDecorations(decorationsRef.current, []);
      }
      decorationsRef.current = [];
      
      // Clean up cleanly upon file switch or unmount
      awareness.off("change", updateDecorations);
      cursorListener.dispose();
      selectionListener.dispose();
      usePresenceStore.getState().updateCursor(null);
      unsubscribe();
    };
  }, [editor, activeFileId, user]);
}
