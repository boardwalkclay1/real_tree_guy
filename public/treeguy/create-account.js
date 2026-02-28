<script type="module">
  const API = window.API_URL;

  // =========================
  // PAGE GUARD
  // =========================
  async function requireTreeGuyPaid(redirect) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = redirect;
      return;
    }

    try {
      const res = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        window.location.href = redirect;
        return;
      }

      const user = await res.json();

      if (user.email === "boardwalkclay1@gmail.com") return;
      if (user.role !== "treeguy") window.location.href = redirect;
      if (!user.hasPaidAccess) window.location.href = redirect;

    } catch {
      window.location.href = redirect;
    }
  }

  await requireTreeGuyPaid("https://realtreeguy.com/treeguy/paywall.html");

  // =========================
  // ELEMENTS
  // =========================
  const form = document.getElementById("treeguyForm");
  const statusBox = document.getElementById("status");

  function setStatus(msg, color = "#444") {
    statusBox.textContent = msg;
    statusBox.style.color = color;
  }

  // =========================
  // SUBMIT HANDLER
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const businessName = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const treeRole = document.querySelector("input[name='role']:checked").value;

    setStatus("Creating your account…");

    try {
      // =========================
      // CREATE USER (NODE API)
      // =========================
      const res = await fetch(`${API}/api/register/treeguy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          businessName,
          phone,
          city,
          state,
          treeRole
        })
      });

      if (!res.ok) {
        setStatus("Error creating account. Check your info and try again.", "red");
        return;
      }

      const data = await res.json();

      // Save JWT token
      localStorage.setItem("token", data.token);

      setStatus("Account created! Redirecting…", "green");

      setTimeout(() => {
        window.location.href = "https://realtreeguy.com/treeguy/dashboard.html";
      }, 800);

    } catch (err) {
      console.error("Signup Error:", err);
      setStatus("Error creating account. Try again.", "red");
    }
  });
</script>
