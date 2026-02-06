const KEY_CUSTOMERS = "tn_customers";
const KEY_EVENTS = "tn_events";

let customers = JSON.parse(localStorage.getItem(KEY_CUSTOMERS) || "[]");
let events = JSON.parse(localStorage.getItem(KEY_EVENTS) || "[]");

const nameEl = document.getElementById("custName");
const phoneEl = document.getElementById("custPhone");
const emailEl = document.getElementById("custEmail");
const addrEl = document.getElementById("custAddress");
const jobEl = document.getElementById("custJob");
const quoteEl = document.getElementById("custQuote");

const listEl = document.getElementById("customerList");
const detailsEl = document.getElementById("customerDetails");

function saveCustomers() {
  localStorage.setItem(KEY_CUSTOMERS, JSON.stringify(customers));
}

function renderList() {
  listEl.innerHTML = "";
  if (customers.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No customers yet";
    opt.value = "";
    listEl.appendChild(opt);
    detailsEl.textContent = "";
    return;
  }

  customers.forEach((c, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = `${c.name} — ${c.phone}`;
    listEl.appendChild(opt);
  });

  listEl.selectedIndex = 0;
  renderDetails(0);
}

function renderDetails(index) {
  const c = customers[index];
  if (!c) {
    detailsEl.textContent = "";
    return;
  }

  detailsEl.textContent =
`Name: ${c.name}
Phone: ${c.phone}
Email: ${c.email}
Address: ${c.address}

Job:
${c.job}

Quote:
${c.quote}`;
}

document.getElementById("saveCustomer").onclick = () => {
  const name = nameEl.value.trim();
  if (!name) {
    alert("Name is required.");
    return;
  }

  const customer = {
    id: Date.now(),
    name,
    phone: phoneEl.value.trim(),
    email: emailEl.value.trim(),
    address: addrEl.value.trim(),
    job: jobEl.value.trim(),
    quote: quoteEl.value.trim()
  };

  // If a customer with same name+phone exists, update it
  const existingIndex = customers.findIndex(
    c => c.name === customer.name && c.phone === customer.phone
  );

  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }

  saveCustomers();
  renderList();
  alert("Customer saved.");
};

listEl.onchange = () => {
  const idx = parseInt(listEl.value, 10);
  renderDetails(idx);
};

document.getElementById("deleteCustomer").onclick = () => {
  const idx = parseInt(listEl.value, 10);
  if (isNaN(idx)) return;
  if (!confirm("Delete this customer?")) return;

  customers.splice(idx, 1);
  saveCustomers();
  renderList();
};

document.getElementById("callCustomer").onclick = () => {
  const idx = parseInt(listEl.value, 10);
  const c = customers[idx];
  if (!c || !c.phone) {
    alert("No phone number.");
    return;
  }
  window.location.href = `tel:${c.phone}`;
};

document.getElementById("emailCustomer").onclick = () => {
  const idx = parseInt(listEl.value, 10);
  const c = customers[idx];
  if (!c || !c.email) {
    alert("No email address.");
    return;
  }

  const subject = encodeURIComponent("Tree Service Job");
  const body = encodeURIComponent(
`Hi ${c.name},

Regarding your tree work:

Job:
${c.job}

Quote:
${c.quote}

Thank you!`
  );

  window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
};

document.getElementById("mapCustomer").onclick = () => {
  const idx = parseInt(listEl.value, 10);
  const c = customers[idx];
  if (!c || !c.address) {
    alert("No address.");
    return;
  }
  const q = encodeURIComponent(c.address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
};

document.getElementById("addToCalendar").onclick = () => {
  const idx = parseInt(listEl.value, 10);
  const c = customers[idx];
  if (!c) return;

  const today = new Date().toISOString().split("T")[0];

  events.push({
    id: Date.now(),
    date: today,
    title: `Job: ${c.name}`,
    type: "task",
    notes: `${c.job}\nQuote: ${c.quote}`,
    customerName: c.name,
    customerPhone: c.phone,
    customerEmail: c.email,
    customerAddress: c.address
  });

  localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
  alert("Job added to calendar.");
};

renderList();
