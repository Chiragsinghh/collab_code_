import { create } from "zustand";

export const useLayoutStore = create((set) => ({
  // Toggle states
  sidebarOpen: true,
  previewOpen: true,
  consoleOpen: true,
  chatOpen: false,

  // Dimensions (Pixels)
  sidebarWidth: 250,
  previewWidth: 400,
  consoleHeight: 200,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  togglePreview: () => set((state) => ({ previewOpen: !state.previewOpen })),
  toggleConsole: () => set((state) => ({ consoleOpen: !state.consoleOpen })),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(150, width) }),
  setPreviewWidth: (width) => set({ previewWidth: Math.max(300, width) }),
  setConsoleHeight: (height) => set({ consoleHeight: Math.max(100, height) }),
}));
