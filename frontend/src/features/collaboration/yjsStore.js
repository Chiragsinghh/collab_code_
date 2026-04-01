import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

class YjsStore {
  constructor() {
    this.doc = null;
    this.provider = null;
    this.roomId = null;
  }

  init(roomId) {
    if (this.roomId === roomId && this.doc) return;

    if (this.provider) {
      this.provider.destroy();
    }
    if (this.doc) {
      this.doc.destroy();
    }

    this.roomId = roomId;
    this.doc = new Y.Doc();
    
    // Single global provider for the room
    this.provider = new WebsocketProvider(
      `ws://localhost:5001/yjs/${roomId}`,
      roomId,
      this.doc
    );

    this.provider.on("status", (event) => {
      console.log(`🔌 Yjs Websocket status: ${event.status} (Room: ${roomId})`);
    });
  }

  getOrCreateText(fileId) {
    if (!this.doc || !fileId) return null;
    return this.doc.getText(fileId);
  }

  destroy() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }
    if (this.doc) {
      this.doc.destroy();
      this.doc = null;
    }
    this.roomId = null;
  }
}

export const yjsStore = new YjsStore();