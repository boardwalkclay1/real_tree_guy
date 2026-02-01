document.getElementById("why").textContent =
  "Finding work is the engine of the business. No leads = no jobs.";

const door = [
  "Walk neighborhoods with problem trees",
  "Be respectful and brief",
  "Offer free estimates",
  "Leave a flyer"
];

const online = [
  "Google Business Profile",
  "Simple website",
  "Before/after photos",
  "Ask for reviews"
];

function render(id, arr) {
  const ul = document.getElementById(id);
  arr.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    ul.appendChild(li);
  });
}

render("doorList", door);
render("onlineList", online);
