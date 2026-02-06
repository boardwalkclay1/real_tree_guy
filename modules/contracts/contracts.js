// Load business profile
let biz = JSON.parse(localStorage.getItem("business_profile") || "{}");

// Load existing contracts
let contracts = JSON.parse(localStorage.getItem("tn_contracts") || "[]");

// Generate next contract ID
function generateContractId() {
  const year = new Date().getFullYear();
  const count = contracts.length + 1;
  return `TN-${year}-${String(count).padStart(5, "0")}`;
}

function generateContract() {
  const id = generateContractId();
  const name = document.getElementById("clientName").value;
  const phone = document.getElementById("clientPhone").value;
  const email = document.getElementById("clientEmail").value;
  const address = document.getElementById("clientAddress").value;
  const scope = document.getElementById("scope").value;
  const price = document.getElementById("price").value;

  const timestamp = new Date().toLocaleString();

  const contract = `
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

  document.getElementById("previewBox").textContent = contract;

  return { id, contract, name, email, timestamp, scope, price };
}

document.getElementById("fill").onclick = () => generateContract();

document.getElementById("send").onclick = () => {
  const data = generateContract();
  const mailto = `mailto:${data.email}?subject=Tree Work Agreement ${data.id}&body=${encodeURIComponent(data.contract)}`;
  window.location.href = mailto;
};

// SAVE CONTRACT TO ARCHIVE
document.getElementById("save").onclick = () => {
  const data = generateContract();
  contracts.push(data);
  localStorage.setItem("tn_contracts", JSON.stringify(contracts));
  alert("Contract saved!");
};

// SEND TO CALENDAR
document.getElementById("calendar").onclick = () => {
  const data = generateContract();

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

  alert("Added to calendar!");
};
