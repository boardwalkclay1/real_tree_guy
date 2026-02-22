const climber = [
  "Climbs and cuts",
  "Sets ropes",
  "Communicates with ground crew",
  "Understands rigging and cuts"
];

const ground = [
  "Handles ropes",
  "Feeds chipper",
  "Moves brush",
  "Keeps site clean"
];

const sales = [
  "Books estimates",
  "Walks jobs with customers",
  "Prices jobs",
  "Earns 10–15% commission"
];

function render(id, arr) {
  const ul = document.getElementById(id);
  arr.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    ul.appendChild(li);
  });
}

render("climberList", climber);
render("groundList", ground);
render("salesList", sales);
