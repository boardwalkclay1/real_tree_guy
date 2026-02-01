const keyR = "tree_reminders";
let reminders = JSON.parse(localStorage.getItem(keyR) || "[]");

const dateEl = document.getElementById("date");
const noteEl = document.getElementById("note");
const listEl = document.getElementById("list");

function render() {
  listEl.innerHTML = "";
  reminders.forEach(r => {
    const div = document.createElement("div");
    div.textContent = `${r.date} — ${r.note}`;
    listEl.appendChild(div);
  });
}

document.getElementById("add").onclick = () => {
  reminders.push({ date: dateEl.value, note: noteEl.value });
  localStorage.setItem(keyR, JSON.stringify(reminders));
  render();
};

document.getElementById("clear").onclick = () => {
  reminders = [];
  localStorage.setItem(keyR, JSON.stringify(reminders));
  render();
};

render();
