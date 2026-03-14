// =========================
// STATIC AUTH (NO BACKEND)
// =========================

// OWNER ACCOUNT
const OWNER_EMAIL = "boardwalkclay1@gmail.com";
const OWNER_PASSWORD = "Always/6";

// UI
const statusEl = document.getElementById("loginStatus");
const enterBtn = document.getElementById("enterOS");

// ROUTES
const LOGIN_URL = "/treeguy/login.html";
const OWNER_DASHBOARD = "/treeguy/dashboard.html";
const CLIENT_DASHBOARD = "/client/dashboard.html";
const TREEGUY_DASHBOARD = "/treeguy/dashboard.html";
const TREEGUY_PAYWALL = "/treeguy/paywall.html";

// =========================
// SESSION HELPERS
// =========================
function getSession() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function updateStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

// =========================
// GET USER (STATIC)
// =========================
async function getUser() {
  const session = getSession();
  if (!session) return null;

  // OWNER FORCE ENTRY
  if (session.email === OWNER_EMAIL) {
    return {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      role: "treeguy",
      hasPaidAccess: true
    };
  }

  // Normal users stored in IndexedDB
  try {
    const db = await window.RTG.getUser(session.email);
    return db || null;
  } catch {
    return null;
  }
}

// =========================
// INIT
// =========================
init();

async function init() {
  await checkAuthState();
  setupEnterButton();
}

// =========================
// CHECK AUTH STATE
// =========================
async function checkAuthState() {
  const user = await getUser();

  if (!user) {
    updateStatus("Not logged in.");
    return;
  }

  updateStatus("Welcome back, " + user.email);
}

// =========================
// ENTRY LOGIC
// =========================
function setupEnterButton() {
  enterBtn.addEventListener("click", async () => {
    const user = await getUser();

    // Not logged in
    if (!user) {
      window.location.href = LOGIN_URL;
      return;
    }

    // OWNER ALWAYS GOES TO TREEGUY DASHBOARD
    if (user.email === OWNER_EMAIL) {
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
