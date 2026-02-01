const flyerKey = "tree_flyer";

let flyer = JSON.parse(localStorage.getItem(flyerKey) || `{
  "headline":"Professional Tree Removal",
  "body":"Safe, insured, reliable tree work.",
  "offer":"10% off first-time customers",
  "contact":"Call 555-123-4567"
}`);

const headline = document.getElementById("headline");
const body = document.getElementById("body");
const offer = document.getElementById("offer");
const contact = document.getElementById("contact");
const preview = document.getElementById("preview");

function load() {
  headline.value = flyer.headline;
  body.value = flyer.body;
  offer.value = flyer.offer;
  contact.value = flyer.contact;
  render();
}

function render() {
  preview.innerHTML = `
    <h3>${flyer.headline}</h3>
    <p>${flyer.body}</p>
    <p><strong>${flyer.offer}</strong></p>
    <p>${flyer.contact}</p>
  `;
}

document.getElementById("save").onclick = () => {
  flyer = {
    headline: headline.value,
    body: body.value,
    offer: offer.value,
    contact: contact.value
  };
  localStorage.setItem(flyerKey, JSON.stringify(flyer));
  render();
};

load();
