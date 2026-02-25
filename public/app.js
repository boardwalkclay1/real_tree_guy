<script type="module">
  import PocketBase from "https://cdn.jsdelivr.net/npm/pocketbase@0.21.1/dist/pocketbase.esm.js";

  // CONNECT TO BACKEND
  const pb = new PocketBase("https://pocketbase-production-f2f5.up.railway.app");

  // PAYPAL CLIENT ID
  const PAYPAL_CLIENT_ID = "AbOWNaiw7BricJM6I4VZqFfNapFMPqo20zVcZWFY69fm6rOSHoIhj9siVEsw8Ykqh-j2S8vU-BZd8dzP";

  // GLOBAL USER
  let currentUser = null;

  // INIT
  init();
  async function init() {
    await testConnection();
    await checkAuthState();
  }

  // TEST PB CONNECTION
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

  function updateStatus(msg) {
    const el = document.getElementById("loginStatus");
    if (el) el.textContent = msg;
  }

  // AUTH + ROLE ENFORCEMENT
  async function checkAuthState() {
    currentUser = pb.authStore.model;

    if (!currentUser) {
      updateStatus("New here? Create an account to get started.");
      return;
    }

    updateStatus("Welcome back, " + currentUser.email);

    if (currentUser.role === "client") {
      console.log("Client access granted.");
    }

    if (currentUser.role === "treeguy") {
      if (!currentUser.hasPaidAccess) {
        window.location.href = "/treeguy/paywall.html";
        return;
      }
      console.log("Tree Guy OS unlocked.");
    }
  }

  // PAYPAL LOADER
  async function loadPayPal() {
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      document.body.appendChild(script);
      await new Promise(res => script.onload = res);
    }
  }

  // TREE GUY $30 PAYMENT
  window.renderTreeGuyPaywall = async function() {
    await loadPayPal();

    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: "30.00" } }]
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();

        // Record payment
        await pb.collection("payments").create({
          user: currentUser.id,
          amount: 30,
          type: "treeguy_access",
          status: "completed",
          paypalOrderId: details.id
        });

        // Unlock Tree Guy OS
        await pb.collection("users").update(currentUser.id, {
          hasPaidAccess: true
        });

        window.location.href = "/treeguy/create-account.html";
      }
    }).render("#paypal-button-container");
  };

  // CLIENT JOB PAYMENT (20 or 40)
  window.renderClientJobPayment = async function(mode) {
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

        // Record payment
        await pb.collection("payments").create({
          user: currentUser.id,
          amount: Number(amount),
          type: mode === "standard" ? "job_post" : "auction_post",
          status: "completed",
          paypalOrderId: details.id
        });

        // Create job shell
        await pb.collection("jobs").create({
          client: currentUser.id,
          mode,
          pricePaid: Number(amount)
        });

        window.location.href = "/client/dashboard.html";
      }
    }).render("#paypal-job-button");
  };

  // EXPORT HELPERS
  window.RTG = {
    pb,
    currentUser,
    requireTreeGuyPaid: () => {
      if (!pb.authStore.model?.hasPaidAccess) {
        window.location.href = "/treeguy/paywall.html";
      }
    },
    requireClient: () => {
      if (pb.authStore.model?.role !== "client") {
        window.location.href = "/";
      }
    }
  };
</script>
