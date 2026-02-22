const ops = [
  "Answer calls fast",
  "Show up on time",
  "Walk the job with the customer",
  "Keep crew organized",
  "Take before/after photos"
];

const pricing = [
  "Know your hourly cost",
  "Add buffer for surprises",
  "Charge more for risk",
  "Price by the job",
  "Don't race to the bottom"
];

const insurance = [
  "General liability protects property",
  "Workers' comp protects crew",
  "LLC separates personal assets",
  "Government jobs require paperwork"
];

function render(id, arr) {
  const ul = document.getElementById(id);
  arr.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    ul.appendChild(li);
  });
}

render("opsList", ops);
render("priceList", pricing);
render("insList", insurance);
