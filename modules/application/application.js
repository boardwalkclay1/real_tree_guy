const key = "tree_applications";
let apps = JSON.parse(localStorage.getItem(key) || "[]");

const nameEl = document.getElementById("name");
const phoneEl = document.getElementById("phone");
const emailEl = document.getElementById("email");
const addrEl = document.getElementById("address");
const expEl = document.getElementById("experience");
const refEl = document.getElementById("references");

const listEl = document.getElementById("appList");
const detailsEl = document.getElementById("details");

function save() {
  apps.push({
    name: nameEl.value,
    phone: phoneEl.value,
    email: emailEl.value,
    address: addrEl.value,
    experience: expEl.value,
    references: refEl.value
  });
  localStorage.setItem(key, JSON.stringify(apps));
  renderList();
}

function renderList() {
  listEl.innerHTML = "";
  apps.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = a.name;
    listEl.appendChild(opt);
  });
}

function show() {
  const i = listEl.value;
  if (!apps[i]) return;
  const a = apps[i];
  detailsEl.innerHTML = `
    <p><strong>${a.name}</strong></p>
    <p>${a.phone}</p>
    <p>${a.email}</p>
    <p>${a.address}</p>
    <p>${a.experience}</p>
    <p>${a.references}</p>
  `;
}

function remove() {
  const i = listEl.value;
  apps.splice(i, 1);
  localStorage.setItem(key, JSON.stringify(apps));
  renderList();
  detailsEl.innerHTML = "";
}

document.getElementById("save").onclick = save;
document.getElementById("delete").onclick = remove;
listEl.onchange = show;

renderList();
