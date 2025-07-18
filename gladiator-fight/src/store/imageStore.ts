// store/imageStore.ts

import { openDB, type DBSchema } from 'idb';

const DB_NAME = 'GladiatorImageDB';
const STORE_NAME = 'characterImages';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: string; // Character ID
    value: string; // Base64 Image Data
  };
}

// 1. Initialize the database
const dbPromise = openDB<MyDB>(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

// 2. Create functions to interact with the database
export const imageStore = {
  /**
   * Saves or updates an image for a given character ID.
   * @param id - The character's unique ID.
   * @param imageData - The base64 string of the image.
   */
  async saveImage(id: string, imageData: string): Promise<void> {
    try {
      const db = await dbPromise;
      await db.put(STORE_NAME, imageData, id);
      console.log(`Image saved for ID: ${id}`);
    } catch (error) {
      console.error("Failed to save image to IndexedDB:", error);
    }
  },

  /**
   * Retrieves an image for a given character ID.
   * @param id - The character's unique ID.
   * @returns The base64 image string, or undefined if not found.
   */
  async getImage(id: string): Promise<string | undefined> {
    try {
      const db = await dbPromise;
      return await db.get(STORE_NAME, id);
    } catch (error) {
      console.error("Failed to get image from IndexedDB:", error);
      return undefined;
    }
  },

  /**
   * Deletes an image for a given character ID.
   * @param id - The character's unique ID.
   */
  async deleteImage(id: string): Promise<void> {
    try {
      const db = await dbPromise;
      await db.delete(STORE_NAME, id);
    } catch (error) {
      console.error("Failed to delete image from IndexedDB:", error);
    }
  },
};