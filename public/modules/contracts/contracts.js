import PocketBase from "https://cdn.jsdelivr.net/npm/pocketbase@0.21.1/dist/pocketbase.es.mjs";

const pb = new PocketBase("https://pocketbase-production-f2f5.up.railway.app");

// LOAD BUSINESS PROFILE FROM POCKETBASE
let biz = {};

async function loadBusinessProfile() {
  try {
    const record = await pb.collection("business_profile").getFirstListItem("");
    biz = record;
  } catch (err) {
    console.error("Business profile missing:", err);
    biz = {};
  }
}

await loadBusinessProfile();

// GENERATE CONTRACT ID
function generateContractId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999);
  return `TN-${year}-${String(random).padStart(5, "0")}`;
}

// BUILD CONTRACT OBJECT
function buildContractObject() {
  const id = generateContractId();
  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const email = document.getElementById("clientEmail").value.trim();
  const address = document.getElementById("clientAddress").value.trim();
  const scope = document.getElementById("scope").value.trim();
  const price = document.getElementById("price").value.trim();

  const timestamp = new Date().toLocaleString();

  const body = `
TREE WORK AGREEMENT
Contract ID: ${id}
Generated: ${timestamp}

Client Information:
Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}

Business Information:
Company: ${biz.name || ""}
Owner: ${biz.owner || ""}
Phone: ${biz.phone || ""}
Email: ${biz.email || ""}
Address: ${biz.address || ""}

-----------------------------------------
SCOPE OF WORK
-----------------------------------------
${scope}

-----------------------------------------
PRICE
-----------------------------------------
${price}

-----------------------------------------
TERMS
-----------------------------------------
• Client agrees to allow access to property.
• Work will be completed professionally and safely.
• Payment is due upon completion unless otherwise stated.
• Client may reply to this email with their typed name as an e-signature.

-----------------------------------------
SIGNATURES
-----------------------------------------
Client Signature: _______________________

Business Representative: ${biz.owner || ""}
`;

  return {
    id,
    clientName: name,
    clientEmail: email,
    clientPhone: phone,
    clientAddress: address,
    scope,
    price,
    timestamp,
    contract: body
  };
}

// PREVIEW
function renderPreview() {
  const data = buildContractObject();
  document.getElementById("previewBox").textContent = data.contract;
  return data;
}

document.getElementById("fill").onclick = () => {
  renderPreview();
};

// SEND EMAIL
document.getElementById("send").onclick = () => {
  const data = renderPreview();
  if (!data.clientEmail) {
    alert("Client email is required to send.");
    return;
  }
  const mailto = `mailto:${encodeURIComponent(
    data.clientEmail
  )}?subject=${encodeURIComponent(
    "Tree Work Agreement " + data.id
  )}&body=${encodeURIComponent(data.contract)}`;
  window.location.href = mailto;
};

// SAVE CONTRACT TO POCKETBASE
document.getElementById("save").onclick = async () => {
  const data = renderPreview();

  try {
    await pb.collection("contracts").create(data);
    alert("Contract saved to PocketBase.");
  } catch (err) {
    console.error("Save failed:", err);
    alert("Error saving contract.");
  }
};

// SAVE CALENDAR EVENT TO POCKETBASE
document.getElementById("calendar").onclick = async () => {
  const data = renderPreview();

  const event = {
    date: new Date().toISOString().split("T")[0],
    title: `Contract: ${data.id}`,
    type: "contract",
    contractId: data.id,
    notes: data.scope
  };

  try {
    await pb.collection("events").create(event);
    alert("Contract added to calendar.");
  } catch (err) {
    console.error("Calendar save failed:", err);
    alert("Error saving calendar event.");
  }
};
