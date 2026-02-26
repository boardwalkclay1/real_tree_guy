import PocketBase from "https://esm.sh/pocketbase@0.21.1";

// REAL BACKEND
const pb = new PocketBase("https://pocketbase-production-f2f5.up.railway.app");

// UI ELEMENTS
const statusEl = document.getElementById("loginStatus");
const enterBtn = document.getElementById("enterOS");

// OWNER EMAIL
const OWNER = "boardwalkclay1@gmail.com";

// INIT
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
      window.location.href = "/treeguy/login.html";
      return;
    }

    // OWNER BYPASS
    if (user.email === OWNER) {
      window.location.href = "/dashboard.html";
      return;
    }

    // CLIENT
    if (user.role === "client") {
      window.location.href = "/client/dashboard.html";
      return;
    }

    // TREE GUY
    if (user.role === "treeguy") {
      if (user.hasPaidAccess) {
        window.location.href = "/treeguy/dashboard.html";
      } else {
        window.location.href = "/treeguy/paywall.html";
      }
    }
  });
}
