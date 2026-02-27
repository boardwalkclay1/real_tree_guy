import PocketBase from "https://esm.sh/pocketbase@0.21.1";

// Backend API only
const pb = new PocketBase("https://realtreeguy-production.up.railway.app");

// DOM
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");

// Absolute frontend URLs
const LOGIN_URL = "https://realtreeguy.com/treeguy/login.html";
const CREATE_URL = "https://realtreeguy.com/treeguy/create-account.html";

unlock();

async function unlock() {
  try {
    await pb.health.check();

    const user = pb.authStore.model;
    if (!user) return (window.location.href = LOGIN_URL);

    // Record the payment
    await pb.collection("payments").create({
      user: user.id,
      amount: 30,
      type: "treeguy_access",
      status: "paypal_success_redirect"
    });

    // Unlock access
    const updated = await pb.collection("users").update(user.id, {
      hasPaidAccess: true
    });

    // Save updated auth state
    pb.authStore.save(pb.authStore.token, updated);

    statusEl.textContent = "Access unlocked! Redirecting…";

    setTimeout(() => {
      window.location.href = CREATE_URL;
    }, 1200);

  } catch (err) {
    errorEl.textContent = "Error unlocking your access.";
  }
}
