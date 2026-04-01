import { create } from "zustand";
import { yjsStore } from "../collaboration/yjsStore";

export const usePresenceStore = create((set, get) => ({
  users: new Map(),
  localUser: null,

  setLocalUser: (user) => {
    set({ localUser: user });

    const awareness = yjsStore.provider?.awareness;
    if (awareness) {
      awareness.setLocalStateField("user", user);
    }
  },

  updateCursor: (cursor) => {
    const awareness = yjsStore.provider?.awareness;
    if (awareness) {
      awareness.setLocalStateField("cursor", cursor); // ✅ FIXED KEY
    }
  },

  subscribeToAwareness: () => {
    const awareness = yjsStore.provider?.awareness;
    if (!awareness) return () => {};

    const handleUpdate = () => {
      const states = awareness.getStates();
      const newUsers = new Map();

      states.forEach((state, clientId) => {
        if (state.user) {
          newUsers.set(clientId, state);
        }
      });

      set({ users: newUsers });
    };

    awareness.on("change", handleUpdate);
    handleUpdate();

    return () => {
      awareness.off("change", handleUpdate);
    };
  }
}));