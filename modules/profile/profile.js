const key = "business_profile";
let profile = JSON.parse(localStorage.getItem(key) || "{}");

// ELEMENTS
const logoPreview = document.getElementById("logoPreview");
const logoFile = document.getElementById("logoFile");

const insurancePreview = document.getElementById("insurancePreview");
const insuranceFile = document.getElementById("insuranceFile");

// LOAD PROFILE INTO UI
function loadProfile() {
  document.getElementById("bizName").value = profile.name || "";
  document.getElementById("owner").value = profile.owner || "";
  document.getElementById("phone").value = profile.phone || "";
  document.getElementById("email").value = profile.email || "";
  document.getElementById("address").value = profile.address || "";
  document.getElementById("license").value = profile.license || "";
  document.getElementById("insurance").value = profile.insurance || "";

  if (profile.logo) {
    logoPreview.style.backgroundImage = `url(${profile.logo})`;
  }

  if (profile.insurancePhoto) {
    insurancePreview.style.backgroundImage = `url(${profile.insurancePhoto})`;
  }
}

// LOGO UPLOAD
logoFile.onchange = () => {
  const file = logoFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    profile.logo = reader.result;
    logoPreview.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
};

// INSURANCE PHOTO UPLOAD
insuranceFile.onchange = () => {
  const file = insuranceFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    profile.insurancePhoto = reader.result;
    insurancePreview.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
};

// SAVE PROFILE
document.getElementById("save").onclick = () => {
  profile = {
    name: document.getElementById("bizName").value,
    owner: document.getElementById("owner").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    license: document.getElementById("license").value,
    insurance: document.getElementById("insurance").value,
    logo: profile.logo || null,
    insurancePhoto: profile.insurancePhoto || null
  };

  localStorage.setItem(key, JSON.stringify(profile));
  alert("Profile saved.");
};

// INIT
loadProfile();
