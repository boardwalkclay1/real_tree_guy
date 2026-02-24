import PocketBase from "https://cdn.jsdelivr.net/npm/pocketbase@0.21.1/dist/pocketbase.es.mjs";

// CONNECT TO YOUR BACKEND
const pb = new PocketBase("https://pocketbase-production-f2f5.up.railway.app");

// TEST CONNECTION
async function testConnection() {
  try {
    const health = await pb.health.check();
    console.log("PocketBase Connected:", health);
  } catch (err) {
    console.error("PocketBase Connection Error:", err);
  }
}

testConnection();
