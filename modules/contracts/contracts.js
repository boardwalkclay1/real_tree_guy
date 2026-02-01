const custKey = "tree_customers";
const customers = JSON.parse(localStorage.getItem(custKey) || "[]");

const select = document.getElementById("custSelect");
const template = document.getElementById("template");
const body = document.getElementById("contractBody");
const email = document.getElementById("email");

customers.forEach((c, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = c.name;
  select.appendChild(opt);
});

document.getElementById("fill").onclick = () => {
  const c = customers[select.value];
  let text = template.value;
  text = text.replace("[Customer Name]", c.name);
  text = text.replace("[Customer Address]", c.address);
  text = text.replace("[Customer Phone]", c.phone);
  text = text.replace("[Job Description]", c.job);
  text = text.replace("[Quote Amount]", c.quote);
  body.value = text;
};

document.getElementById("send").onclick = () => {
  const mail = email.value;
  const subject = encodeURIComponent("Tree Work Agreement");
  const content = encodeURIComponent(body.value);
  window.location.href = `mailto:${mail}?subject=${subject}&body=${content}`;
};
