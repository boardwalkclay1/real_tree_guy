<script type="module">
  const API = window.API_URL; 
  const PAYPAL_CLIENT_ID = "AbOWNaiw7BricJM6I4VZqFfNapFMPqo20zVcZWFY69fm6rOSHoIhj9siVEsw8Ykqh-j2S8vU-BZd8dzP";
  const OWNER_EMAIL = "boardwalkclay1@gmail.com";

  // =========================
  // AUTH + USER
  // =========================
  function getToken() {
    return localStorage.getItem("token");
  }

  function setToken(t) {
    localStorage.setItem("token", t);
  }

  async function getUser() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${API}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;
    return res.json();
  }

  async function requireAuth(redirect = "treeguy/login.html") {
    const user = await getUser();
    if (!user) window.location.href = redirect;
    return user;
  }

  async function requireClient(redirect = "index.html") {
    const user = await requireAuth();
    if (user.role !== "client") window.location.href = redirect;
    return user;
  }

  async function requireTreeGuyPaid(redirect = "treeguy/paywall.html") {
    const user = await requireAuth();
    if (user.email === OWNER_EMAIL) return user;
    if (!user.hasPaidAccess) window.location.href = redirect;
    return user;
  }

  // =========================
  // ROLE HELPERS
  // =========================
  function isOwner(u) { return u.email === OWNER_EMAIL; }
  function isClient(u) { return u.role === "client"; }
  function isTreeGuy(u) { return u.role === "treeguy"; }

  function updateStatus(msg) {
    const el = document.getElementById("loginStatus");
    if (el) el.textContent = msg;
  }

  // =========================
  // PAYPAL LOADER
  // =========================
  async function loadPayPal() {
    if (window.paypal) return;

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    document.body.appendChild(script);

    await new Promise(res => script.onload = res);
  }

  // =========================
  // TREE GUY PAYWALL
  // =========================
  async function renderTreeGuyPaywall(container = "#paypal-button-container") {
    const user = await requireAuth();

    if (isOwner(user) || user.hasPaidAccess) {
      window.location.href = "treeguy/create-account.html";
      return;
    }

    await loadPayPal();

    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: "30.00" } }]
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();

        await fetch(`${API}/api/payments/treeguy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ paypalOrderId: details.id })
        });

        updateStatus("Tree Guy OS unlocked. Redirecting…");
        window.location.href = "treeguy/create-account.html";
      },
      onError: () => updateStatus("Payment failed. Try again.")
    }).render(container);
  }

  // =========================
  // CLIENT JOB PAYMENT
  // =========================
  async function renderClientJobPayment(mode = "standard", container = "#paypal-job-button", jobData = {}) {
    const user = await requireClient();
    await loadPayPal();

    const amount = mode === "standard" ? "20.00" : "40.00";

    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: amount } }]
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();

        await fetch(`${API}/api/jobs/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            mode,
            amount: Number(amount),
            paypalOrderId: details.id,
            ...jobData
          })
        });

        updateStatus("Job posted. Redirecting…");
        window.location.href = "client/dashboard.html";
      },
      onError: () => updateStatus("Payment failed. Try again.")
    }).render(container);
  }

  // =========================
  // EXPORT
  // =========================
  window.RTG = {
    getUser,
    requireAuth,
    requireClient,
    requireTreeGuyPaid,
    isOwner,
    isClient,
    isTreeGuy,
    renderTreeGuyPaywall,
    renderClientJobPayment,
    updateStatus,
    setToken
  };
</script>
