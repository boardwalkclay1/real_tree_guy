import PocketBase from "https://esm.sh/pocketbase@0.21.1";

const PB_URL = "https://realtreeguy-production.up.railway.app";
const pb = new PocketBase(PB_URL);

// =========================
// PAGE GUARD
// =========================
RTG.requireTreeGuyPaid("/treeguy/paywall.html");

// =========================
// ELEMENTS
// =========================
const form = document.getElementById("treeguyForm");
const statusBox = document.getElementById("status");

function setStatus(msg, color = "#444") {
  statusBox.textContent = msg;
  statusBox.style.color = color;
}

// =========================
// SUBMIT HANDLER
// =========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const businessName = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const treeRole = document.querySelector("input[name='role']:checked").value;

  setStatus("Creating your account…");

  try {
    // =========================
    // CREATE USER
    // =========================
    const newUser = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      role: "treeguy",
      hasPaidAccess: true, // already paid at paywall
      businessName,
      phone,
      city,
      state,
      treeRole
    });

    // =========================
    // AUTO LOGIN
    // =========================
    await pb.collection("users").authWithPassword(email, password);

    setStatus("Account created! Redirecting…", "green");

    setTimeout(() => {
      window.location.href = "/treeguy/dashboard.html";
    }, 800);

  } catch (err) {
    console.error("Signup Error:", err);
    setStatus("Error creating account. Check your info and try again.", "red");
  }
});
