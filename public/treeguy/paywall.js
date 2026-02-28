<script type="module">
  const API = window.API_URL;

  const statusMsg = document.getElementById("statusMsg");
  const errorMsg = document.getElementById("errorMsg");

  const OWNER = "boardwalkclay1@gmail.com";

  // Absolute frontend URLs
  const LOGIN_URL = "https://realtreeguy.com/treeguy/login.html";
  const CREATE_URL = "https://realtreeguy.com/treeguy/create-account.html";
  const HOME_URL = "https://realtreeguy.com/index.html";

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

  // =========================
  // INIT
  // =========================
  init();

  async function init() {
    try {
      const user = await getUser();

      // Not logged in
      if (!user) {
        window.location.href = LOGIN_URL;
        return;
      }

      // OWNER BYPASS
      if (user.email === OWNER) {
        statusMsg.textContent = "Owner bypass active. Redirecting…";
        window.location.href = CREATE_URL;
        return;
      }

      // NOT A TREE GUY → send home
      if (user.role !== "treeguy") {
        window.location.href = HOME_URL;
        return;
      }

      // ALREADY PAID → send to create account
      if (user.hasPaidAccess) {
        window.location.href = CREATE_URL;
        return;
      }

      // Payment canceled
      if (window.location.search.includes("cancel")) {
        statusMsg.textContent = "Payment canceled. You can retry below.";
      } else {
        statusMsg.textContent = "Scan the QR code or tap Buy Now to pay.";
      }

    } catch (err) {
      errorMsg.textContent = "Unable to connect to backend.";
    }
  }
</script>
