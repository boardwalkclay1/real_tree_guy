<script type="module">
  import PocketBase from "https://esm.sh/pocketbase@0.21.1";

  // =========================
  // CORE CONFIG
  // =========================
  const PB_URL = "https://realtreeguy-production.up.railway.app";
  const PAYPAL_CLIENT_ID = "AbOWNaiw7BricJM6I4VZqFfNapFMPqo20zVcZWFY69fm6rOSHoIhj9siVEsw8Ykqh-j2S8vU-BZd8dzP";
  const OWNER_EMAIL = "boardwalkclay1@gmail.com";

  // =========================
  // POCKETBASE CLIENT
  // =========================
  const pb = new PocketBase(PB_URL);
  let currentUser = null;

  // =========================
  // INIT (OPTIONAL PER PAGE)
  // =========================
  init();
  async function init() {
    await testConnection();
    syncAuthModel();
  }

  async function testConnection() {
    try {
      const health = await pb.health.check();
      console.log("PocketBase Connected:", health);
      updateStatus("Backend Connected.");
    } catch (err) {
      console.error("PocketBase Connection Error:", err);
      updateStatus("Backend Connection Failed.");
    }
  }

  function syncAuthModel() {
    currentUser = pb.authStore.model;
    if (currentUser) {
      console.log("Authenticated as:", currentUser.email);
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
  // OWNER / ROLE / ACCESS LOGIC
  // =========================
  function isOwner(user = currentUser) {
    return !!user && user.email === OWNER_EMAIL;
  }

  function isClient(user = currentUser) {
    return !!user && user.role === "client";
  }

  function isTreeGuy(user = currentUser) {
    return !!user && user.role === "treeguy";
  }

  function hasTreeGuyAccess(user = currentUser) {
    return isOwner(user) || (isTreeGuy(user) && user.hasPaidAccess);
  }

  function requireAuth(redirectTo = "/treeguy/login.html") {
    syncAuthModel();
    if (!currentUser) {
      window.location.href = redirectTo;
    }
  }

  function requireClient(redirectTo = "/") {
    requireAuth();
    if (!isClient()) {
      window.location.href = redirectTo;
    }
  }

  function requireTreeGuyPaid(redirectTo = "/treeguy/paywall.html") {
    requireAuth();
    if (!hasTreeGuyAccess()) {
      window.location.href = redirectTo;
    }
  }

  // =========================
  // PAYPAL SDK LOADER
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
  // TREE GUY $30 OS UNLOCK
  // =========================
  async function renderTreeGuyPaywall(containerSelector = "#paypal-button-container") {
    requireAuth();

    if (isOwner()) {
      console.log("Owner bypass: Tree Guy OS unlocked.");
      window.location.href = "/treeguy/create-account.html";
      return;
    }

    if (hasTreeGuyAccess()) {
      console.log("Already has Tree Guy access.");
      window.location.href = "/treeguy/create-account.html";
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
        window.location.href = "/treeguy/create-account.html";
      },
      onError: (err) => {
        console.error("Tree Guy Paywall Error:", err);
        updateStatus("Payment failed. Try again.");
      }
    }).render(containerSelector);
  }

  // =========================
  // CLIENT JOB PAYMENT (20 / 40)
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
        window.location.href = "/client/dashboard.html";
      },
      onError: (err) => {
        console.error("Client Job Payment Error:", err);
        updateStatus("Payment failed. Try again.");
      }
    }).render(containerSelector);
  }

  // =========================
  // GLOBAL EXPORT (WINDOW.RTG)
  // =========================
  window.RTG = {
    pb,
    get currentUser() {
      return pb.authStore.model;
    },

    // Auth / roles
    syncAuthModel,
    requireAuth,
    requireClient,
    requireTreeGuyPaid,
    isOwner,
    isClient,
    isTreeGuy,
    hasTreeGuyAccess,

    // Payments
    renderTreeGuyPaywall,
    renderClientJobPayment,

    // Utils
    updateStatus
  };
</script>
