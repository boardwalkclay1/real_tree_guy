import { getUser } from "../db.js";

const OWNER = "boardwalkclay1@gmail.com";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

const PAYWALL_URL = "/treeguy/paywall.html";
const DASHBOARD_URL = "/treeguy/dashboard.html";
const CLIENT_DASHBOARD_URL = "/client/dashboard.html";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = await getUser(email);

  if (!user || user.password !== password) {
    errorMsg.textContent = "Invalid login. Check your email or password.";
    return;
  }

  // Save session
  localStorage.setItem("currentUser", JSON.stringify(user));

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

  errorMsg.textContent = "Your account role is not recognized.";
});
