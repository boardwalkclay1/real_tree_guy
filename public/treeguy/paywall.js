// paywall.js — Static GitHub Pages + IndexedDB Auth

import { getUser, saveUser } from "../db.js";

const statusMsg = document.getElementById("statusMsg");
const errorMsg = document.getElementById("errorMsg");

const OWNER = "boardwalkclay1@gmail.com";

// Absolute frontend URLs
const LOGIN_URL = "/treeguy/login.html";
const CREATE_URL = "/treeguy/create-account.html";
const HOME_URL = "/index.html";

// =========================
// INIT
// =========================
init();

async function init() {
  try {
    // Load session
    const session = JSON.parse(localStorage.getItem("currentUser"));
    if (!session) {
      window.location.href = LOGIN_URL;
      return;
    }

    // Load full user record from IndexedDB
    const user = await getUser(session.email);
    if (!user) {
      window.location.href = LOGIN_URL;
      return;
    }

    // OWNER BYPASS
    if (user.email === OWNER) {
      statusMsg.textContent = "Owner bypass active. Redirecting…";
      window.location.href = CREATE_URL;
      return;
    }

    // NOT A TREE GUY → send home
    if (user.role !== "treeguy") {
      window.location.href = HOME_URL;
      return;
    }

    // ALREADY PAID → send to create account
    if (user.hasPaidAccess) {
      window.location.href = CREATE_URL;
      return;
    }

    // Payment canceled
    if (window.location.search.includes("cancel")) {
      statusMsg.textContent = "Payment canceled. You can retry below.";
    } else {
      statusMsg.textContent = "Scan the QR code or tap Buy Now to pay.";
    }

  } catch (err) {
    errorMsg.textContent = "Unable to load your account.";
  }
}
