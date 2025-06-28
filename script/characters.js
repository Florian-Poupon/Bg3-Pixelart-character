// characters.js : affichage dynamique des personnages BG3

// Utilitaire pour créer un élément avec classes et attributs
function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.class) el.className = options.class;
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  if (options.attrs) {
    for (const [k, v] of Object.entries(options.attrs)) {
      el.setAttribute(k, v);
    }
  }
  return el;
}

// Charge le JSON et initialise l'affichage
fetch("data.json")
  .then((r) => r.json())
  .then((data) => {
    renderCharacterList(data);
    // Sélectionne le premier personnage par défaut
    if (data.length) {
      selectCharacter(data[0], document.querySelector(".character-card"));
    }
  });

function renderCharacterList(characters) {
  const list = document.getElementById("character-list");
  if (!list) return;
  list.innerHTML = "";
  characters.forEach((char, idx) => {
    const card = createElement("div", { class: "character-card", attrs: { "data-id": char.id } });
    const img = createElement("img", { attrs: { src: char.avatar.replace("./img/", "images/"), alt: char.name } });
    const name = createElement("div", { class: "char-name", text: char.name });
    card.appendChild(img);
    card.appendChild(name);
    card.addEventListener("click", () => selectCharacter(char, card));
    list.appendChild(card);
  });
}

function selectCharacter(char, cardEl) {
  // Met en avant la carte sélectionnée
  document.querySelectorAll(".character-card").forEach((card) => card.classList.remove("selected"));
  if (cardEl) cardEl.classList.add("selected");

  // Affiche les détails
  const details = document.getElementById("character-details");
  if (!details) return;
  details.classList.remove("empty");
  details.innerHTML = "";

  // Header (portrait + nom)
  const header = createElement("div", { class: "char-header" });
  const img = createElement("img", { attrs: { src: char.avatar.replace("./img/", "images/"), alt: char.name } });
  const titleBox = createElement("div");
  const title = createElement("div", { class: "char-title", text: char.name });
  const meta = createElement("div", { class: "char-meta", text: `${char.race} — ${char.class}` });
  titleBox.appendChild(title);
  titleBox.appendChild(meta);
  header.appendChild(img);
  header.appendChild(titleBox);
  details.appendChild(header);

  // Bio
  const bio = createElement("div", { class: "char-bio", text: char.bio });
  details.appendChild(bio);

  // Stats
  const stats = createElement("div", { class: "char-stats" });
  for (const [stat, value] of Object.entries(char.stats)) {
    stats.appendChild(createElement("div", { class: "char-stat", text: `${stat}: ${value}` }));
  }
  stats.appendChild(createElement("div", { class: "char-stat", text: `initiative: +${char.initiative}` }));
  stats.appendChild(createElement("div", { class: "char-stat", text: `points de vie: ${char.hp}` }));
  details.appendChild(stats);

  // Actions
  if (char.actions && char.actions.length) {
    const actions = createElement("div", { class: "char-actions" });
    char.actions.forEach((action) => {
      const actionEl = createElement("div", { class: "char-action" });
      const icon = createElement("img", { attrs: { src: action.icon.replace("./img/", "images/"), alt: action.name } });
      const label = createElement("span", { text: action.name });
      actionEl.appendChild(icon);
      actionEl.appendChild(label);
      actions.appendChild(actionEl);
    });
    details.appendChild(actions);
  }
}
