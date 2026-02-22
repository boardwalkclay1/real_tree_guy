// Business profile expected in localStorage.business_profile
// {
//   "name": "Your Tree Service",
//   "owner": "Your Name",
//   "phone": "555-555-5555",
//   "email": "you@business.com",
//   "address": "123 Street, City, ST"
// }

let biz = JSON.parse(localStorage.getItem("business_profile") || "{}");
let contracts = JSON.parse(localStorage.getItem("tn_contracts") || "[]");

function generateContractId() {
  const year = new Date().getFullYear();
  const count = contracts.length + 1;
  return `TN-${year}-${String(count).padStart(5, "0")}`;
}

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

function renderPreview() {
  const data = buildContractObject();
  document.getElementById("previewBox").textContent = data.contract;
  return data;
}

document.getElementById("fill").onclick = () => {
  renderPreview();
};

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

document.getElementById("save").onclick = () => {
  const data = renderPreview();
  contracts.push(data);
  localStorage.setItem("tn_contracts", JSON.stringify(contracts));
  alert("Contract saved to archive.");
};

document.getElementById("calendar").onclick = () => {
  const data = renderPreview();
  let events = JSON.parse(localStorage.getItem("tn_events") || "[]");

  events.push({
    id: Date.now(),
    date: new Date().toISOString().split("T")[0],
    title: `Contract: ${data.id}`,
    type: "contract",
    contractId: data.id,
    notes: data.scope
  });

  localStorage.setItem("tn_events", JSON.stringify(events));
  alert("Contract added to calendar.");
};
