import PocketBase from "https://esm.sh/pocketbase@0.21.1";

// Backend API only
const pb = new PocketBase("https://realtreeguy-production.up.railway.app");

// DOM
const statusMsg = document.getElementById("statusMsg");
const errorMsg = document.getElementById("errorMsg");

// Constants
const OWNER = "boardwalkclay1@gmail.com";

// These paths are relative to /public/treeguy/
const LOGIN_URL = "login.html";
const CREATE_URL = "create-account.html";
const HOME_URL = "../index.html";

init();

async function init() {
  try {
    await pb.health.check();

    const user = pb.authStore.model;
    if (!user) return (window.location.href = LOGIN_URL);

    // OWNER BYPASS
    if (user.email === OWNER) {
      statusMsg.textContent = "Owner bypass active. Redirecting…";
      return (window.location.href = CREATE_URL);
    }

    // ONLY TREE GUYS CAN BE HERE
    if (user.role !== "treeguy") {
      return (window.location.href = HOME_URL);
    }

    // ALREADY PAID
    if (user.hasPaidAccess) {
      return (window.location.href = CREATE_URL);
    }

    // PAYMENT CANCELED DETECTION
    if (window.location.search.includes("cancel")) {
      statusMsg.textContent = "Payment canceled. You can retry below.";
    } else {
      statusMsg.textContent = "Scan the QR code or tap Buy Now to pay.";
    }

  } catch (err) {
    errorMsg.textContent = "Unable to connect to backend.";
  }
}
