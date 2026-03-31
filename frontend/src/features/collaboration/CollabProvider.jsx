import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { yjsStore } from "./yjsStore";

const CollabContext = createContext(null);

export function CollabProvider({ children }) {
  const { id } = useParams(); // Extract dynamically assigned room ID from URL param
  const [ydoc, setYdoc] = useState(null);

  useEffect(() => {
    if (!id) return;

    yjsStore.init(id);
    setYdoc(yjsStore.doc);

    console.log("✅ Yjs initialized for room:", id);

    return () => {
      // Optional: uncomment if you want the room session to stop instantly on unmount
      // yjsStore.destroy();
      // setYdoc(null);
    };
  }, [id]);

  if (!ydoc) {
    return <div>Connecting to room {id}...</div>;
  }

  return (
    <CollabContext.Provider value={{ ydoc }}>
      {children}
    </CollabContext.Provider>
  );
}

export const useCollab = () => {
  const ctx = useContext(CollabContext);

  if (!ctx) {
    throw new Error("useCollab must be used inside CollabProvider");
  }

  return ctx;
};