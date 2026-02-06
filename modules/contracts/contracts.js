// Load business profile (saved elsewhere in your CRM)
let biz = JSON.parse(localStorage.getItem("business_profile") || "{}");

function generateContract() {
  const name = document.getElementById("clientName").value;
  const phone = document.getElementById("clientPhone").value;
  const email = document.getElementById("clientEmail").value;
  const address = document.getElementById("clientAddress").value;
  const scope = document.getElementById("scope").value;
  const price = document.getElementById("price").value;

  const now = new Date();
  const timestamp = now.toLocaleString();

  const contract = `
TREE WORK AGREEMENT
Generated: ${timestamp}

Client Information:
Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}

Business Information:
Company: ${biz.name || "Your Business Name"}
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

  return contract;
}

document.getElementById("fill").onclick = generateContract;

document.getElementById("send").onclick = () => {
  const contract = generateContract();
  const email = document.getElementById("clientEmail").value;

  const mailto = `mailto:${email}?subject=Tree Work Agreement&body=${encodeURIComponent(contract)}`;
  window.location.href = mailto;
};
