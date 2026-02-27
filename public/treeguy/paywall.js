// paywall.js (FINAL, CLEAN, FIXED)
import PocketBase from "https://esm.sh/pocketbase@0.21.1";

const pb = new PocketBase("https://realtreeguy-production.up.railway.app");

const statusMsg = document.getElementById("statusMsg");
const errorMsg = document.getElementById("errorMsg");

const OWNER = "boardwalkclay1@gmail.com";

const LOGIN_URL = "login.html";
const CREATE_URL = "create-account.html";
const HOME_URL = "../index.html";

init();

async function init() {
  try {
    await pb.health.check();

    const user = pb.authStore.model;
    if (!user) return (window.location.href = LOGIN_URL);

    if (user.email === OWNER) {
      statusMsg.textContent = "Owner bypass active. Redirecting…";
      return (window.location.href = CREATE_URL);
    }

    if (user.role !== "treeguy") {
      return (window.location.href = HOME_URL);
    }

    if (user.hasPaidAccess) {
      return (window.location.href = CREATE_URL);
    }

    if (window.location.search.includes("cancel")) {
      statusMsg.textContent = "Payment canceled. You can retry below.";
    } else {
      statusMsg.textContent = "Scan the QR code or tap Buy Now to pay.";
    }

  } catch (err) {
    errorMsg.textContent = "Unable to connect to backend.";
  }
}
