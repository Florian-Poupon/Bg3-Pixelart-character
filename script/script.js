function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

const container = document.querySelector(".leaf-container");
const leafCount = 10;

if (container) {
  for (let i = 0; i < leafCount; i++) {
    const leaf = document.createElement("div");
    leaf.classList.add("leaf");
    leaf.style.opacity = "0";

    let startX = randomBetween(0, window.innerWidth);
    let angle = randomBetween(-30, 30); // angle de chute en degrés
    const duration = randomBetween(4, 10); // durée de la chute en secondes

    leaf.style.left = `${startX}px`;
    leaf.style.top = `-40px`;

    // Progression aléatoire au démarrage
    let progress = Math.random();

    function animateLeaf() {
      leaf.style.opacity = "1";
      progress += 1 / (60 * duration);
      if (progress > 1) {
        progress = 0;
        startX = randomBetween(0, window.innerWidth);
        angle = randomBetween(-30, 30);
        leaf.style.left = `${startX}px`;
        leaf.style.top = `-40px`;
      }

      const dist = window.innerHeight + 80;
      const x = startX + Math.tan((angle * Math.PI) / 180) * progress * dist;
      const y = progress * dist - 40;

      leaf.style.transform = `translate(${x - startX}px, ${y}px)`;

      requestAnimationFrame(animateLeaf);
    }

    // Décalage de lancement pour chaque feuille
    setTimeout(animateLeaf, randomBetween(0, 3000));

    container.appendChild(leaf);
  }
}

function toggleMusic() {
  try {
    const music = document.querySelector(".music");
    const audio = document.querySelector("#audio-music");

    if (music && audio) {
      if (eval("music.src").includes("off")) {
        eval("music.src = 'images/sprites/music_on.png';");
        eval("audio.play();");
      } else {
        eval("music.src = 'images/sprites/music_off.png';");
        eval("audio.pause();");
      }
    }
  } catch (error) {
    console.log("Erreur lors du toggle de la musique:", error);
  }
}
