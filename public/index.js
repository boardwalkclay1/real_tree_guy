<script type="module">
  const API = window.API_URL; 
  const OWNER = "boardwalkclay1@gmail.com";

  // UI
  const statusEl = document.getElementById("loginStatus");
  const enterBtn = document.getElementById("enterOS");

  // FRONTEND ROOT
  const FRONTEND = "https://realtreeguy-production.up.railway.app";

  // ABSOLUTE ROUTES
  const LOGIN_URL = `${FRONTEND}/treeguy/login.html`;
  const OWNER_DASHBOARD = `${FRONTEND}/dashboard.html`;
  const CLIENT_DASHBOARD = `${FRONTEND}/client/dashboard.html`;
  const TREEGUY_DASHBOARD = `${FRONTEND}/treeguy/dashboard.html`;
  const TREEGUY_PAYWALL = `${FRONTEND}/treeguy/paywall.html`;

  // =========================
  // AUTH HELPERS
  // =========================
  function getToken() {
    return localStorage.getItem("token");
  }

  async function getUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  function updateStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // =========================
  // INIT
  // =========================
  init();

  async function init() {
    await checkConnection();
    await checkAuthState();
    setupEnterButton();
  }

  // =========================
  // CHECK BACKEND CONNECTION
  // =========================
  async function checkConnection() {
    try {
      const res = await fetch(`${API}/api/health`);
      if (res.ok) updateStatus("Backend Connected.");
      else updateStatus("Backend Connection Failed.");
    } catch {
      updateStatus("Backend Connection Failed.");
    }
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

      // OWNER
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
</script>
