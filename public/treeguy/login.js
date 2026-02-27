import PocketBase from "https://esm.sh/pocketbase@0.21.1";

// Backend API only
const pb = new PocketBase("https://realtreeguy-production.up.railway.app");

// DOM
const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// Constants
const OWNER = "boardwalkclay1@gmail.com";

// Paths relative to /public/treeguy/
const PAYWALL_URL = "paywall.html";
const DASHBOARD_URL = "dashboard.html";
const CLIENT_DASHBOARD_URL = "../client/dashboard.html";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const auth = await pb.collection("users").authWithPassword(email, password);
    const user = auth.record;

    // OWNER BYPASS
    if (user.email === OWNER) {
      window.location.href = DASHBOARD_URL;
      return;
    }

    // CLIENT LOGIN
    if (user.role === "client") {
      window.location.href = CLIENT_DASHBOARD_URL;
      return;
    }

    // TREE GUY LOGIN
    if (user.role === "treeguy") {
      if (!user.hasPaidAccess) {
        window.location.href = PAYWALL_URL;
        return;
      }

      window.location.href = DASHBOARD_URL;
      return;
    }

    // Unknown role fallback
    errorMsg.textContent = "Your account role is not recognized.";

  } catch (err) {
    errorMsg.textContent = "Invalid login. Check your email or password.";
  }
});
