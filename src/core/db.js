import Dexie from "dexie";

export const db = new Dexie("GraphStudioDB");

// Define your schema here
db.version(1).stores({
  settings: "", // Simple key-value store (one object)
  history: "++id,timestamp", // Auto-increment ID + searchable timestamp
});
