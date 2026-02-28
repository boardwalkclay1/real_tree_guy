<script type="module">
  const API = window.API_URL;

  // =========================
  // AUTH HELPERS
  // =========================
  function getToken() {
    return localStorage.getItem("token");
  }

  async function getUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async function requireAuth(redirect = "/treeguy/login.html") {
    const user = await getUser();
    if (!user) window.location.href = redirect;
    return user;
  }

  // =========================
  // ELEMENTS
  // =========================
  const logoPreview = document.getElementById("logoPreview");
  const logoFile = document.getElementById("logoFile");

  const insurancePreview = document.getElementById("insurancePreview");
  const insuranceFile = document.getElementById("insuranceFile");

  let profileRecord = null;

  // =========================
  // LOAD PROFILE (NODE API)
  // =========================
  async function loadProfile() {
    const token = getToken();

    try {
      const res = await fetch(`${API}/api/profile/business`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.warn("No business profile found — will create on save.");
        return;
      }

      profileRecord = await res.json();

      document.getElementById("bizName").value = profileRecord.name || "";
      document.getElementById("owner").value = profileRecord.owner || "";
      document.getElementById("phone").value = profileRecord.phone || "";
      document.getElementById("email").value = profileRecord.email || "";
      document.getElementById("address").value = profileRecord.address || "";
      document.getElementById("license").value = profileRecord.license || "";
      document.getElementById("insurance").value = profileRecord.insurance || "";

      if (profileRecord.logo_url) {
        logoPreview.style.backgroundImage = `url(${profileRecord.logo_url})`;
      }

      if (profileRecord.insurance_url) {
        insurancePreview.style.backgroundImage = `url(${profileRecord.insurance_url})`;
      }

    } catch (err) {
      console.error("Load failed:", err);
    }
  }

  // =========================
  // SAVE PROFILE (NODE API)
  // =========================
  document.getElementById("save").onclick = async () => {
    const token = getToken();
    const formData = new FormData();

    formData.append("name", document.getElementById("bizName").value);
    formData.append("owner", document.getElementById("owner").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("license", document.getElementById("license").value);
    formData.append("insurance", document.getElementById("insurance").value);

    if (logoFile.files[0]) {
      formData.append("logo", logoFile.files[0]);
    }
    if (insuranceFile.files[0]) {
      formData.append("insurancePhoto", insuranceFile.files[0]);
    }

    try {
      const url = profileRecord
        ? `${API}/api/profile/business/update`
        : `${API}/api/profile/business/create`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        alert("Error saving profile.");
        return;
      }

      alert("Profile saved.");
      loadProfile();

    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving profile.");
    }
  };

  // =========================
  // INIT
  // =========================
  await requireAuth();
  loadProfile();
</script>
