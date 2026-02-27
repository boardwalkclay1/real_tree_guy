import PocketBase from "https://esm.sh/pocketbase@0.21.1";

// REAL BACKEND (UPDATED)
const pb = new PocketBase("https://realtreeguy-production.up.railway.app");

// UI ELEMENTS
const statusEl = document.getElementById("loginStatus");
const enterBtn = document.getElementById("enterOS");

// OWNER EMAIL
const OWNER = "boardwalkclay1@gmail.com";

// ABSOLUTE FRONTEND URLS
const LOGIN_URL = "https://realtreeguy.com/treeguy/login.html";
const OWNER_DASHBOARD = "https://realtreeguy.com/dashboard.html";
const CLIENT_DASHBOARD = "https://realtreeguy.com/client/dashboard.html";
const TREEGUY_DASHBOARD = "https://realtreeguy.com/treeguy/dashboard.html";
const TREEGUY_PAYWALL = "https://realtreeguy.com/treeguy/paywall.html";

init();

async function init() {
  await checkConnection();
  await checkAuthState();
  setupEnterButton();
}

// CHECK BACKEND CONNECTION
async function checkConnection() {
  try {
    await pb.health.check();
    statusEl.textContent = "Backend Connected.";
  } catch (err) {
    statusEl.textContent = "Backend Connection Failed.";
  }
}

// CHECK AUTH STATE
async function checkAuthState() {
  const user = pb.authStore.model;

  if (!user) {
    statusEl.textContent = "Not logged in.";
    return;
  }

  statusEl.textContent = "Welcome back, " + user.email;
}

// OS ENTRY LOGIC
function setupEnterButton() {
  enterBtn.addEventListener("click", () => {
    const user = pb.authStore.model;

    // Not logged in
    if (!user) {
      window.location.href = LOGIN_URL;
      return;
    }

    // OWNER BYPASS
    if (user.email === OWNER) {
      window.location.href = OWNER_DASHBOARD;
      return;
    }

    // CLIENT
    if (user.role === "client") {
      window.location.href = CLIENT_DASHBOARD;
      return;
    }

    // TREE GUY
    if (user.role === "treeguy") {
      if (user.hasPaidAccess) {
        window.location.href = TREEGUY_DASHBOARD;
      } else {
        window.location.href = TREEGUY_PAYWALL;
      }
    }
  });
}
