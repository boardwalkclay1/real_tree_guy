// ============================================================
// REAL TREE GUY OS — CALENDAR ENGINE (TIDY + ORGANIZED)
// LocalStorage Event System
// ============================================================

// ------------------------------------------------------------
// MASTER STORAGE
// ------------------------------------------------------------
const KEY = "tn_events";
let events = JSON.parse(localStorage.getItem(KEY) || "[]");

// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------
const grid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");

const modal = document.getElementById("modal");
const modalDate = document.getElementById("modalDate");
const titleEl = document.getElementById("eventTitle");
const typeEl = document.getElementById("eventType");
const notesEl = document.getElementById("eventNotes");
const contractIdEl = document.getElementById("contractId");
const contractLabel = document.getElementById("contractLabel");

// ------------------------------------------------------------
// CURRENT MONTH STATE
// ------------------------------------------------------------
let current = new Date();

// ============================================================
// CALENDAR RENDERING
// ============================================================
function renderCalendar() {
  grid.innerHTML = "";

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthLabel.textContent = current.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  // Blank cells before month starts
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "day blank";
    grid.appendChild(blank);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const day = document.createElement("div");
    day.className = "day";

    // Day number
    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;
    day.appendChild(num);

    // Events for this day
    const todaysEvents = events.filter(e => e.date === dateStr);

    todaysEvents.forEach(ev => {
      const el = document.createElement("div");
      el.className = "event";

      // Color coding
      if (ev.type === "contract") el.style.background = "#4ade80";
      if (ev.type === "reminder") el.style.background = "#38bdf8";
      if (ev.type === "task") el.style.background = "#facc15";

      el.textContent = ev.title;

      el.onclick = (e) => {
        e.stopPropagation();
        openEvent(ev);
      };

      day.appendChild(el);
    });

    // Click to create event
    day.onclick = () => openModal(dateStr);

    grid.appendChild(day);
  }
}

// ============================================================
// MONTH NAVIGATION
// ============================================================
document.getElementById("prev").onclick = () => {
  current.setMonth(current.getMonth() - 1);
  renderCalendar();
};

document.getElementById("next").onclick = () => {
  current.setMonth(current.getMonth() + 1);
  renderCalendar();
};

// ============================================================
// MODAL LOGIC
// ============================================================

// Open modal for NEW event
function openModal(date) {
  modal.style.display = "flex";
  modalDate.textContent = date;

  titleEl.value = "";
  notesEl.value = "";
  contractIdEl.value = "";
  typeEl.value = "task";

  contractLabel.style.display = "none";
  contractIdEl.style.display = "none";
}

// Open modal for EXISTING event
function openEvent(ev) {
  modal.style.display = "flex";

  modalDate.textContent = ev.date;
  titleEl.value = ev.title;
  notesEl.value = ev.notes || "";
  typeEl.value = ev.type;
  contractIdEl.value = ev.contractId || "";

  const isContract = ev.type === "contract";
  contractLabel.style.display = isContract ? "block" : "none";
  contractIdEl.style.display = isContract ? "block" : "none";
}

// Close modal
document.getElementById("closeModal").onclick = () => {
  modal.style.display = "none";
};

// Show/hide contract ID field
typeEl.onchange = () => {
  const isContract = typeEl.value === "contract";
  contractLabel.style.display = isContract ? "block" : "none";
  contractIdEl.style.display = isContract ? "block" : "none";
};

// ============================================================
// EVENT SAVE / UPDATE
// ============================================================
document.getElementById("saveEvent").onclick = () => {
  const date = modalDate.textContent;
  const title = titleEl.value.trim();
  const type = typeEl.value;
  const notes = notesEl.value.trim();
  const contractId = contractIdEl.value.trim();

  if (!title) {
    alert("Title required.");
    return;
  }

  // Remove old version of this event (edit mode)
  events = events.filter(e => !(e.date === date && e.title === title));

  // Add new/updated event
  events.push({
    id: Date.now(),
    date,
    title,
    type,
    notes,
    contractId: type === "contract" ? contractId : null
  });

  localStorage.setItem(KEY, JSON.stringify(events));

  modal.style.display = "none";
  renderCalendar();
};

// ============================================================
// INITIAL RENDER
// ============================================================
renderCalendar();
