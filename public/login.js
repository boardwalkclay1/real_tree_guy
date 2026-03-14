import { getUser } from "../db.js";

// =========================
// INSERT YOUR EMAIL + PASSWORD HERE
// =========================
const OWNER_EMAIL = "boardwalkclay1@gmail.com";   // <-- YOUR EMAIL
const OWNER_PASSWORD = "Always/6";                // <-- YOUR PASSWORD
// =================================================

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

const PAYWALL_URL = "/treeguy/paywall.html";
const DASHBOARD_URL = "/treeguy/dashboard.html";
const CLIENT_DASHBOARD_URL = "/client/dashboard.html";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // =========================
  // OWNER FORCE ENTRY
  // =========================
  if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
    const ownerUser = {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      role: "treeguy",
      hasPaidAccess: true
    };

    localStorage.setItem("currentUser", JSON.stringify(ownerUser));
    window.location.href = DASHBOARD_URL;
    return;
  }

  // =========================
  // NORMAL USER LOGIN
  // =========================
  const user = await getUser(email);

  if (!user || user.password !== password) {
    errorMsg.textContent = "Invalid login. Check your email or password.";
    return;
  }

  // Save session
  localStorage.setItem("currentUser", JSON.stringify(user));

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

  errorMsg.textContent = "Your account role is not recognized.";
});
