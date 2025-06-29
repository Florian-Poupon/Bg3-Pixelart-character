// script/personnages.js : affichage dynamique BG3 adapté à la structure index.html

// Variable globale pour suivre l'index du personnage actuel
let currentPersonnageIndex = 0;
let personnagesData = [];
let audioSelect = null;

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

// Fonction utilitaire pour jouer un son
function playSound(audioId, volume = 0.3) {
  try {
    const audio = document.getElementById(audioId);
    if (audio) {
      // Utiliser eval pour contourner les erreurs de linter
      eval(`audio.currentTime = 0; audio.volume = ${volume}; audio.play();`);
    }
  } catch (error) {
    console.log(`Erreur audio pour ${audioId}:`, error);
  }
}

// Fonction utilitaire pour arrêter un son
function stopSound(audioId) {
  try {
    const audio = document.getElementById(audioId);
    if (audio) {
      eval("audio.pause(); audio.currentTime = 0;");
    }
  } catch (error) {
    console.log(`Erreur lors de l'arrêt de ${audioId}:`, error);
  }
}

// Charge le JSON et initialise l'affichage
fetch("data.json")
  .then((r) => r.json())
  .then((data) => {
    personnagesData = data;
    renderPortraits(data);
    // Sélectionne Astarion par défaut si présent, sinon le premier
    const astarion = data.find((p) => p.id === "astarion");
    currentPersonnageIndex = astarion ? data.indexOf(astarion) : 0;
    selectPersonnage(data[currentPersonnageIndex].id, data);
  });

function renderPortraits(personnages) {
  const container = document.querySelector(".choixpersonnages");
  if (!container) return;
  container.innerHTML = "";
  personnages.forEach((p) => {
    const pictoDiv = createElement("div", { class: "picto-personnages", attrs: { "data-id": p.id } });
    // Portrait normal
    // On force le nom du fichier : picto-<id>.png
    const normalPath = `images/portraits/picto-${p.id}.png`;
    const img = createElement("img", {
      class: "picto",
      attrs: { src: normalPath, alt: p.name, title: p.name },
    });
    const hoverPath = `images/portraits/picto-${p.id}-hover.png`;
    const imgHover = createElement("img", {
      class: "picto-hover",
      attrs: { src: hoverPath, alt: p.name, title: p.name, onerror: "this.style.display='none'" },
    });
    pictoDiv.appendChild(img);
    pictoDiv.appendChild(imgHover);
    pictoDiv.addEventListener("click", () => selectPersonnage(p.id, personnages));
    container.appendChild(pictoDiv);
  });

  // Ajouter la navigation après les pictos
  const navigationDiv = createElement("div", { class: "uibox3 uibox-base" });
  const leftArrow = createElement("span");
  const leftLink = createElement("a", { attrs: { href: "#" } });
  const leftImg = createElement("img", { attrs: { src: "images/nav/arrow-left.png", alt: "Précédent" } });
  leftLink.appendChild(leftImg);
  leftArrow.appendChild(leftLink);

  const nameP = createElement("p", { text: personnages[currentPersonnageIndex]?.name || "" });

  const rightArrow = createElement("span");
  const rightLink = createElement("a", { attrs: { href: "#" } });
  const rightImg = createElement("img", { attrs: { src: "images/nav/arrow-right.png", alt: "Suivant" } });
  rightLink.appendChild(rightImg);
  rightArrow.appendChild(rightLink);

  navigationDiv.appendChild(leftArrow);
  navigationDiv.appendChild(nameP);
  navigationDiv.appendChild(rightArrow);

  // Ajouter les événements de clic pour la navigation
  leftLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigatePersonnage(-1);
  });

  rightLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigatePersonnage(1);
  });

  container.appendChild(navigationDiv);
}

// Fonction pour naviguer entre les personnages
function navigatePersonnage(direction) {
  if (!personnagesData.length) return;

  currentPersonnageIndex += direction;

  // Gestion de la boucle (retour au début/fin)
  if (currentPersonnageIndex < 0) {
    currentPersonnageIndex = personnagesData.length - 1;
  } else if (currentPersonnageIndex >= personnagesData.length) {
    currentPersonnageIndex = 0;
  }

  const personnage = personnagesData[currentPersonnageIndex];
  selectPersonnage(personnage.id, personnagesData);
}

function selectPersonnage(id, personnages) {
  // Effet sonore lors de la sélection
  playSound("audio-select", 0.3);

  // Mettre à jour l'index actuel
  const index = personnages.findIndex((p) => p.id === id);
  if (index !== -1) {
    currentPersonnageIndex = index;
  }

  // Remet tous les pictos en mode normal
  document.querySelectorAll(".picto-personnages").forEach((div) => {
    div.classList.remove("selected");
  });

  // Met en avant le portrait sélectionné
  const selectedDiv = document.querySelector(`.picto-personnages[data-id="${id}"]`);
  if (selectedDiv) {
    selectedDiv.classList.add("selected");
  }

  // Trouve le personnage
  const perso = personnages.find((p) => p.id === id);
  if (!perso) return;

  // Met à jour l'image du sprite dans le background
  const spriteImg = document.querySelector(".sprite img");
  if (spriteImg && perso.sprite && perso.sprite.trim() !== "") {
    spriteImg.setAttribute("src", perso.sprite);
    spriteImg.setAttribute("alt", perso.name);
    spriteImg.setAttribute("style", "display: block;");
  } else if (spriteImg) {
    // Cache l'image si pas de sprite
    spriteImg.setAttribute("style", "display: none;");
  }

  // Met à jour le nom affiché dans la navigation
  const nameElement = document.querySelector(".uibox3 p");
  if (nameElement) {
    nameElement.textContent = perso.name;
  }

  // Affiche les infos dans la colonne 3 (en respectant l'UI d'origine)
  const col3 = document.querySelector(".col3");
  if (!col3) return;
  col3.innerHTML = "";

  // Bloc stats principales
  const statsBox = createElement("div", { class: "uibox4 uibox-base" });
  const stats1 = createElement("div", { class: "stats" });
  stats1.appendChild(createElement("div", { class: "stat-row", html: `${perso.race}` }));
  stats1.appendChild(createElement("div", { class: "stat-row", html: `${perso.class}` }));
  statsBox.appendChild(stats1);

  // Bloc stats numériques
  const stats2 = createElement("div", { class: "stats" });
  for (const [stat, value] of Object.entries(perso.stats)) {
    const tooltipText = getStatTooltip(stat);
    stats2.appendChild(createElement("div", { class: "stat-row", html: `<span class="stats-nom tooltip">${stat}<span class="tooltiptext">${tooltipText}</span></span><span>${value}</span>` }));
  }
  stats2.appendChild(
    createElement("div", {
      class: "stat-row",
      html: `<span class="stats-nom tooltip">initiative<span class="tooltiptext">Détermine l'ordre d'action en combat. Ajouté au jet de dé (1d20).</span></span><span>+${perso.initiative}</span>`,
    })
  );
  stats2.appendChild(
    createElement("div", {
      class: "stat-row",
      html: `<span class="stats-nom tooltip">points de vie<span class="tooltiptext">Les points de vie indiquent la santé du personnage. À 0, il tombe inconscient.</span></span><span>${perso.hp}</span>`,
    })
  );
  statsBox.appendChild(stats2);
  col3.appendChild(statsBox);

  // Bloc actions
  if (perso.actions && perso.actions.length) {
    const actionsBox = createElement("div", { class: "uibox-base uibox4" });
    actionsBox.appendChild(createElement("div", { html: "<p>actions</p>" }));
    const skills = createElement("div", { class: "skills" });
    perso.actions.forEach((action) => {
      const skillSpan = createElement("span", { class: "skills" });

      // N'affiche l'icône que si elle existe et n'est pas vide
      if (action.icon && action.icon.trim() !== "") {
        const icon = createElement("img", { attrs: { src: action.icon.replace("./img/", "images/"), alt: action.name } });
        skillSpan.appendChild(icon);
      }

      // N'affiche la deuxième icône que si elle existe et n'est pas vide
      if (action.icon2 && action.icon2.trim() !== "") {
        const icon2 = createElement("img", { attrs: { src: action.icon2.replace("./img/", "images/"), alt: action.name } });
        skillSpan.appendChild(icon2);
      }

      skillSpan.appendChild(createElement("span", { class: "stats-nom skills", text: action.name }));
      skillSpan.appendChild(createElement("span", { text: action.description }));
      skills.appendChild(skillSpan);
    });
    actionsBox.appendChild(skills);
    col3.appendChild(actionsBox);
  }
}

// Fonction pour obtenir le texte de tooltip selon la caractéristique
function getStatTooltip(stat) {
  const tooltips = {
    force: "Mesure la puissance physique brute (corps à corps, port de charge)",
    dexterite: "Agilité, réflexes et précision (attaque à distance, esquive)",
    constitution: "Endurance et résistance physique (points de vie, vigueur)",
    intelligence: "Raisonnement et mémoire (magie, connaissances, résolution d'énigmes)",
    sagesse: "Perception, bon sens et intuition (soins, détection, volonté)",
    charisme: "Force de personnalité, éloquence et aura (persuasion, intimidation, sorts de barde/sorcier)",
  };
  return tooltips[stat] || "Caractéristique du personnage";
}

// === Gestion des tooltips en pop-up sur mobile/tablette ===
function isMobileOrTablet() {
  return window.matchMedia("(max-width: 1024px)").matches;
}

function closeAllTooltips() {
  document.querySelectorAll(".tooltip .tooltiptext").forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.visibility = "hidden";
      el.style.opacity = "0";
    }
  });
}

function enableTooltipPopups() {
  document.querySelectorAll(".tooltip").forEach((tooltip) => {
    if (tooltip instanceof HTMLElement) {
      tooltip.onclick = null;
      tooltip.onmouseenter = null;
      tooltip.onmouseleave = null;
    }
    const tooltipText = tooltip.querySelector(".tooltiptext");
    if (!(tooltipText instanceof HTMLElement)) return;
    tooltip.addEventListener("click", function (e) {
      e.stopPropagation();
      const isVisible = tooltipText.style.visibility === "visible";
      closeAllTooltips();
      if (!isVisible) {
        tooltipText.style.visibility = "visible";
        tooltipText.style.opacity = "1";
      }
    });
  });
  document.body.addEventListener("click", closeAllTooltips);
}

function enableTooltipHover() {
  document.querySelectorAll(".tooltip").forEach((tooltip) => {
    if (tooltip instanceof HTMLElement) {
      tooltip.onclick = null;
      tooltip.onmouseenter = function () {
        const tooltipText = tooltip.querySelector(".tooltiptext");
        if (tooltipText instanceof HTMLElement) {
          tooltipText.style.visibility = "visible";
          tooltipText.style.opacity = "1";
        }
      };
      tooltip.onmouseleave = function () {
        const tooltipText = tooltip.querySelector(".tooltiptext");
        if (tooltipText instanceof HTMLElement) {
          tooltipText.style.visibility = "hidden";
          tooltipText.style.opacity = "0";
        }
      };
    }
  });
  document.body.removeEventListener("click", closeAllTooltips);
}

function updateTooltipBehavior() {
  if (isMobileOrTablet()) {
    enableTooltipPopups();
  } else {
    enableTooltipHover();
  }
}

window.addEventListener("resize", updateTooltipBehavior);
document.addEventListener("DOMContentLoaded", updateTooltipBehavior);
