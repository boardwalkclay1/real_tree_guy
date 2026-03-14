// unlock.js — Static GitHub Pages + IndexedDB Auth

import { getUser, saveUser } from "../db.js";

const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");

const OWNER = "boardwalkclay1@gmail.com";

const LOGIN_URL = "/treeguy/login.html";
const CREATE_URL = "/treeguy/create-account.html";

// =========================
// INIT
// =========================
unlock();

async function unlock() {
  try {
    // Load session
    const session = JSON.parse(localStorage.getItem("currentUser"));

    // OWNER ALWAYS GETS IN — EVEN IF SESSION IS BROKEN
    if (session && session.email === OWNER) {
      statusEl.textContent = "Owner bypass active. Redirecting…";
      window.location.href = CREATE_URL;
      return;
    }

    // No session → login
    if (!session) {
      window.location.href = LOGIN_URL;
      return;
    }

    // Load full user record from IndexedDB
    const user = await getUser(session.email);

    // If DB fails but session email is owner → still bypass
    if (!user && session.email === OWNER) {
      statusEl.textContent = "Owner bypass active. Redirecting…";
      window.location.href = CREATE_URL;
      return;
    }

    // If user missing and not owner → login
    if (!user) {
      window.location.href = LOGIN_URL;
      return;
    }

    // OWNER BYPASS (normal path)
    if (user.email === OWNER) {
      statusEl.textContent = "Owner bypass active. Redirecting…";
      window.location.href = CREATE_URL;
      return;
    }

    // Unlock access locally
    user.hasPaidAccess = true;
    await saveUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));

    statusEl.textContent = "Access unlocked! Redirecting…";

    setTimeout(() => {
      window.location.href = CREATE_URL;
    }, 1200);

  } catch (err) {
    // FINAL OWNER SAFETY NET
    const session = JSON.parse(localStorage.getItem("currentUser"));
    if (session && session.email === OWNER) {
      window.location.href = CREATE_URL;
      return;
    }

    errorEl.textContent = "Error unlocking your access.";
  }
}
