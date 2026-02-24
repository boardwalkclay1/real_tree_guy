import PocketBase from "https://cdn.jsdelivr.net/npm/pocketbase@0.21.1/dist/pocketbase.es.mjs";

const pb = new PocketBase("https://pocketbase-production-f2f5.up.railway.app");

// The single business profile record (we'll fetch or create it)
let profileRecord = null;

// ELEMENTS
const logoPreview = document.getElementById("logoPreview");
const logoFile = document.getElementById("logoFile");

const insurancePreview = document.getElementById("insurancePreview");
const insuranceFile = document.getElementById("insuranceFile");

// LOAD PROFILE FROM POCKETBASE
async function loadProfile() {
  try {
    // Get the first (and only) business profile record
    profileRecord = await pb.collection("business_profile").getFirstListItem("");

    // Fill UI
    document.getElementById("bizName").value = profileRecord.name || "";
    document.getElementById("owner").value = profileRecord.owner || "";
    document.getElementById("phone").value = profileRecord.phone || "";
    document.getElementById("email").value = profileRecord.email || "";
    document.getElementById("address").value = profileRecord.address || "";
    document.getElementById("license").value = profileRecord.license || "";
    document.getElementById("insurance").value = profileRecord.insurance || "";

    // Logo preview
    if (profileRecord.logo) {
      const url = pb.files.getUrl(profileRecord, profileRecord.logo);
      logoPreview.style.backgroundImage = `url(${url})`;
    }

    // Insurance photo preview
    if (profileRecord.insurancePhoto) {
      const url = pb.files.getUrl(profileRecord, profileRecord.insurancePhoto);
      insurancePreview.style.backgroundImage = `url(${url})`;
    }

  } catch (err) {
    console.warn("No business profile found — will create on save.");
  }
}

// SAVE PROFILE TO POCKETBASE
document.getElementById("save").onclick = async () => {
  const formData = new FormData();

  formData.append("name", document.getElementById("bizName").value);
  formData.append("owner", document.getElementById("owner").value);
  formData.append("phone", document.getElementById("phone").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("address", document.getElementById("address").value);
  formData.append("license", document.getElementById("license").value);
  formData.append("insurance", document.getElementById("insurance").value);

  // Attach files if selected
  if (logoFile.files[0]) {
    formData.append("logo", logoFile.files[0]);
  }
  if (insuranceFile.files[0]) {
    formData.append("insurancePhoto", insuranceFile.files[0]);
  }

  try {
    if (profileRecord) {
      // Update existing record
      profileRecord = await pb.collection("business_profile").update(profileRecord.id, formData);
    } else {
      // Create new record
      profileRecord = await pb.collection("business_profile").create(formData);
    }

    alert("Profile saved to PocketBase.");
    loadProfile(); // refresh UI

  } catch (err) {
    console.error("Save failed:", err);
    alert("Error saving profile.");
  }
};

// INIT
loadProfile();
