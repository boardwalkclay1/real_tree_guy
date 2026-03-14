// app.js — Real Tree Guy OS core (GitHub Pages + IndexedDB + PayPal)

import { getUser as getUserDB, saveUser as saveUserDB } from "./db.js";

// =========================
// OWNER CREDENTIALS (PUT YOURS HERE)
// =========================
const OWNER_EMAIL = "boardwalkclay1@gmail.com";   // <-- YOUR EMAIL
const OWNER_PASSWORD = "Always/6";                // <-- YOUR PASSWORD
// ================================================================

const PAYPAL_CLIENT_ID = "AbOWNaiw7BricJM6I4VZqFfNapFMPqo20zVcZWFY69fm6rOSHoIhj9siVEsw8Ykqh-j2S8vU-BZd8dzP";

// =========================
// GLOBAL FAVICON ENFORCER
// =========================
function applyFavicon() {
  const existing = document.querySelector("link[rel='icon']");
  const href = "/public/assets/icons/rtg-192.png";

  if (existing) {
    existing.href = href;
  } else {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = href;
    document.head.appendChild(link);
  }
}

applyFavicon();

// =========================
// SESSION HELPERS
// =========================
function getSession() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function setSession(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// =========================
// AUTH HELPERS
// =========================
async function getUser() {
  const session = getSession();

  // OWNER FORCE ENTRY — SESSION OVERRIDE
  if (session && session.email === OWNER_EMAIL) {
    return {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      role: "treeguy",
      hasPaidAccess: true
    };
  }

  if (!session) return null;

  const user = await getUserDB(session.email);
  return user || null;
}

// =========================
// REQUIRE AUTH (OWNER ALWAYS GETS IN)
// =========================
async function requireAuth(redirect = "/treeguy/login.html") {
  const session = getSession();

  // OWNER FORCE ENTRY — ALWAYS ALLOWED
  if (session && session.email === OWNER_EMAIL) {
    return {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      role: "treeguy",
      hasPaidAccess: true
    };
  }

  const user = await getUser();
  if (!user) {
    window.location.href = redirect;
    return null;
  }

  return user;
}

// =========================
// REQUIRE CLIENT (OWNER ALWAYS PASSES)
// =========================
async function requireClient(redirect = "/index.html") {
  const user = await requireAuth();
  if (!user) return null;

  if (user.email === OWNER_EMAIL) return user;

  if (user.role !== "client") {
    window.location.href = redirect;
    return null;
  }

  return user;
}

// =========================
// REQUIRE TREE GUY PAID (OWNER ALWAYS PASSES)
// =========================
async function requireTreeGuyPaid(redirect = "/treeguy/paywall.html") {
  const user = await requireAuth();
  if (!user) return null;

  if (user.email === OWNER_EMAIL) return user;

  if (!user.hasPaidAccess) {
    window.location.href = redirect;
    return null;
  }

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
// TREE GUY PAYWALL (OWNER ALWAYS SKIPS)
// =========================
async function renderTreeGuyPaywall(container = "#paypal-button-container") {
  const user = await requireAuth();
  if (!user) return;

  if (isOwner(user) || user.hasPaidAccess) {
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

      user.hasPaidAccess = true;
      await saveUserDB(user);
      setSession(user);

      updateStatus("Tree Guy OS unlocked. Redirecting…");
      window.location.href = "/treeguy/create-account.html";
    },
    onError: () => updateStatus("Payment failed. Try again.")
  }).render(container);
}

// =========================
// CLIENT JOB PAYMENT
// =========================
async function renderClientJobPayment(mode = "standard", container = "#paypal-job-button", jobData = {}) {
  const user = await requireClient();
  if (!user) return;

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

      const jobs = JSON.parse(localStorage.getItem("clientJobs") || "[]");

      jobs.push({
        id: crypto.randomUUID(),
        clientEmail: user.email,
        mode,
        amount: Number(amount),
        paypalOrderId: details.id,
        ...jobData,
        createdAt: Date.now()
      });

      localStorage.setItem("clientJobs", JSON.stringify(jobs));

      updateStatus("Job posted. Redirecting…");
      window.location.href = "/client/dashboard.html";
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
  setSession
};
