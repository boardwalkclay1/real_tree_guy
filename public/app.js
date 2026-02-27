<script type="module">
  import PocketBase from "https://esm.sh/pocketbase@0.21.1";

  const PB_URL = "https://realtreeguy-production.up.railway.app";
  const PAYPAL_CLIENT_ID = "AbOWNaiw7BricJM6I4VZqFfNapFMPqo20zVcZWFY69fm6rOSHoIhj9siVEsw8Ykqh-j2S8vU-BZd8dzP";
  const OWNER_EMAIL = "boardwalkclay1@gmail.com";

  const pb = new PocketBase(PB_URL);
  let currentUser = null;

  init();
  async function init() {
    await testConnection();
    syncAuthModel();
  }

  async function testConnection() {
    try {
      await pb.health.check();
      updateStatus("Backend Connected.");
    } catch (err) {
      updateStatus("Backend Connection Failed.");
    }
  }

  function syncAuthModel() {
    currentUser = pb.authStore.model;
    if (currentUser) {
      updateStatus("Welcome back, " + currentUser.email);
    } else {
      updateStatus("New here? Create an account to get started.");
    }
  }

  function updateStatus(msg) {
    const el = document.getElementById("loginStatus");
    if (el) el.textContent = msg;
  }

  // =========================
  // ROLE LOGIC
  // =========================
  function isOwner(u = currentUser) {
    return u && u.email === OWNER_EMAIL;
  }

  function isClient(u = currentUser) {
    return u && u.role === "client";
  }

  function isTreeGuy(u = currentUser) {
    return u && u.role === "treeguy";
  }

  function hasTreeGuyAccess(u = currentUser) {
    return isOwner(u) || (isTreeGuy(u) && u.hasPaidAccess);
  }

  // =========================
  // FIXED REDIRECTS (NO LEADING SLASHES)
  // =========================
  function requireAuth(redirectTo = "treeguy/login.html") {
    syncAuthModel();
    if (!currentUser) window.location.href = redirectTo;
  }

  function requireClient(redirectTo = "index.html") {
    requireAuth();
    if (!isClient()) window.location.href = redirectTo;
  }

  function requireTreeGuyPaid(redirectTo = "treeguy/paywall.html") {
    requireAuth();
    if (!hasTreeGuyAccess()) window.location.href = redirectTo;
  }

  // =========================
  // PAYPAL LOADER
  // =========================
  async function loadPayPal() {
    if (window.paypal) return;

    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      document.body.appendChild(script);
      await new Promise(res => (script.onload = res));
    }
  }

  // =========================
  // TREE GUY PAYWALL
  // =========================
  async function renderTreeGuyPaywall(containerSelector = "#paypal-button-container") {
    requireAuth();

    if (isOwner()) {
      window.location.href = "treeguy/create-account.html";
      return;
    }

    if (hasTreeGuyAccess()) {
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

        await pb.collection("payments").create({
          user: currentUser.id,
          amount: 30,
          type: "treeguy_access",
          status: "completed",
          paypalOrderId: details.id
        });

        const updated = await pb.collection("users").update(currentUser.id, {
          hasPaidAccess: true
        });

        pb.authStore.save(pb.authStore.token, updated);
        syncAuthModel();

        updateStatus("Tree Guy OS unlocked. Redirecting…");
        window.location.href = "treeguy/create-account.html";
      },
      onError: () => {
        updateStatus("Payment failed. Try again.");
      }
    }).render(containerSelector);
  }

  // =========================
  // CLIENT JOB PAYMENT
  // =========================
  async function renderClientJobPayment(mode = "standard", containerSelector = "#paypal-job-button", jobData = {}) {
    requireClient();

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

        await pb.collection("payments").create({
          user: currentUser.id,
          amount: Number(amount),
          type: mode === "standard" ? "job_post" : "auction_post",
          status: "completed",
          paypalOrderId: details.id
        });

        await pb.collection("jobs").create({
          client: currentUser.id,
          mode,
          pricePaid: Number(amount),
          ...jobData
        });

        updateStatus("Job posted. Redirecting…");
        window.location.href = "client/dashboard.html";
      },
      onError: () => {
        updateStatus("Payment failed. Try again.");
      }
    }).render(containerSelector);
  }

  window.RTG = {
    pb,
    get currentUser() {
      return pb.authStore.model;
    },
    syncAuthModel,
    requireAuth,
    requireClient,
    requireTreeGuyPaid,
    isOwner,
    isClient,
    isTreeGuy,
    hasTreeGuyAccess,
    renderTreeGuyPaywall,
    renderClientJobPayment,
    updateStatus
  };
</script>
