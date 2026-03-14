import { saveUser, getUser } from "../db.js";

const form = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  const existing = await getUser(email);
  if (existing) {
    errorMsg.textContent = "An account with this email already exists.";
    return;
  }

  const user = {
    email,
    password,          // You can hash this if you want
    role,
    hasPaidAccess: false,
    createdAt: Date.now()
  };

  await saveUser(user);

  window.location.href = "/treeguy/login.html";
});
