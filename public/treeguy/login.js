// =========================
// STATIC AUTH (GitHub Pages)
// =========================

// OWNER EMAIL
const OWNER = "boardwalkclay1@gmail.com";

// DOM
const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// FRONTEND ROUTES
const PAYWALL_URL = "/treeguy/paywall.html";
const DASHBOARD_URL = "/treeguy/dashboard.html";
const CLIENT_DASHBOARD_URL = "/client/dashboard.html";

// Load users from localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

// =========================
// LOGIN HANDLER
// =========================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const users = getUsers();
  const user = users.find(u => u.email === email);

  // USER NOT FOUND
  if (!user) {
    errorMsg.textContent = "Invalid login. Check your email or password.";
    return;
  }

  // =========================
  // OWNER BYPASS — NO PASSWORD REQUIRED
  // =========================
  if (user.email === OWNER) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = DASHBOARD_URL;
    return;
  }

  // =========================
  // NORMAL USERS REQUIRE PASSWORD
  // =========================
  if (user.password !== password) {
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
