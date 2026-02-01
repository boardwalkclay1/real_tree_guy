const key = "tree_customers";
let customers = JSON.parse(localStorage.getItem(key) || "[]");

const nameEl = document.getElementById("custName");
const phoneEl = document.getElementById("custPhone");
const addrEl = document.getElementById("custAddress");
const jobEl = document.getElementById("custJob");
const quoteEl = document.getElementById("custQuote");

const listEl = document.getElementById("customerList");
const detailsEl = document.getElementById("customerDetails");

function save() {
  customers.push({
    name: nameEl.value,
    phone: phoneEl.value,
    address: addrEl.value,
    job: jobEl.value,
    quote: quoteEl.value
  });
  localStorage.setItem(key, JSON.stringify(customers));
  renderList();
}

function renderList() {
  listEl.innerHTML = "";
  customers.forEach((c, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${c.name} — ${c.address}`;
    listEl.appendChild(opt);
  });
}

function showDetails() {
  const i = listEl.value;
  if (!customers[i]) return;
  const c = customers[i];
  detailsEl.innerHTML = `
    <p><strong>${c.name}</strong></p>
    <p>${c.phone}</p>
    <p>${c.address}</p>
    <p>${c.job}</p>
    <p><strong>${c.quote}</strong></p>
  `;
}

function remove() {
  const i = listEl.value;
  customers.splice(i, 1);
  localStorage.setItem(key, JSON.stringify(customers));
  renderList();
  detailsEl.innerHTML = "";
}

document.getElementById("saveCustomer").onclick = save;
document.getElementById("deleteCustomer").onclick = remove;
listEl.onchange = showDetails;

renderList();
