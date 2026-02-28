<script type="module">
  const API = window.API_URL;

  // DOM
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  // OWNER EMAIL
  const OWNER = "boardwalkclay1@gmail.com";

  // ABSOLUTE FRONTEND URLS
  const PAYWALL_URL = "https://realtreeguy.com/treeguy/paywall.html";
  const DASHBOARD_URL = "https://realtreeguy.com/treeguy/dashboard.html";
  const CLIENT_DASHBOARD_URL = "https://realtreeguy.com/client/dashboard.html";

  // =========================
  // LOGIN HANDLER
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // POST to Node backend
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        errorMsg.textContent = "Invalid login. Check your email or password.";
        return;
      }

      const data = await res.json();

      // Save JWT
      localStorage.setItem("token", data.token);

      const user = data.user;

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
      errorMsg.textContent = "Login failed. Try again.";
    }
  });
</script>
