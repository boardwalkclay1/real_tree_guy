<script type="module">
  const API = window.API_URL;

  const statusEl = document.getElementById("status");
  const errorEl = document.getElementById("error");

  const LOGIN_URL = "https://realtreeguy.com/treeguy/login.html";
  const CREATE_URL = "https://realtreeguy.com/treeguy/create-account.html";

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
  // UNLOCK ACCESS
  // =========================
  unlock();

  async function unlock() {
    try {
      const user = await getUser();

      // Not logged in
      if (!user) {
        window.location.href = LOGIN_URL;
        return;
      }

      // Record payment + unlock access in backend
      const res = await fetch(`${API}/api/payments/unlock-treeguy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          amount: 30,
          type: "treeguy_access",
          status: "paypal_success_redirect"
        })
      });

      if (!res.ok) {
        errorEl.textContent = "Error unlocking your access.";
        return;
      }

      statusEl.textContent = "Access unlocked! Redirecting…";

      setTimeout(() => {
        window.location.href = CREATE_URL;
      }, 1200);

    } catch (err) {
      errorEl.textContent = "Error unlocking your access.";
    }
  }
</script>
