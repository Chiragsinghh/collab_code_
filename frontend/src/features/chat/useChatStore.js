import { create } from "zustand";
import { yjsStore } from "../collaboration/yjsStore";
import { v4 as uuidv4 } from "uuid";

export const useChatStore = create((set, get) => ({
  messages: [],

  subscribeToChat: () => {
    const doc = yjsStore.doc;
    if (!doc) return;

    const yChat = doc.getArray("chat");

    const updateMessages = () => {
      set({ messages: yChat.toArray() });
    };

    yChat.observe(updateMessages);
    updateMessages(); // Initial sync

    return () => {
      yChat.unobserve(updateMessages);
    };
  },

  sendMessage: (text, user) => {
    const doc = yjsStore.doc;
    if (!doc || !text.trim()) return;

    const yChat = doc.getArray("chat");

    const message = {
      id: uuidv4(),
      user: {
        name: user?.name || "Anonymous",
        color: user?.color || "#6c63ff",
      },
      text,
      timestamp: Date.now(),
    };

    yChat.push([message]);
  },
}));
