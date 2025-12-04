// ====== DOM ELEMENTS ======
const filmsGrid = document.getElementById("films-grid");
const statusEl = document.getElementById("status");

const heroCard = document.getElementById("hero-card");
const heroTitle = document.getElementById("hero-title");
const heroDescription = document.getElementById("hero-description");
const heroMeta = document.getElementById("hero-meta");

const randomFilmBtn = document.getElementById("random-film-btn");
const pulseBtn = document.getElementById("pulse-btn");

// Store all films once for reuse
let allFilms = [];

// ====== FETCH FROM STUDIO GHIBLI API ======
async function fetchFilms() {
  statusEl.textContent = "Loading Studio Ghibli films...";
  try {
    const res = await fetch("https://ghibliapi.vercel.app/films");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    allFilms = data;
    renderFilms(data);
    setRandomHeroFilm();
    statusEl.textContent = `Loaded ${data.length} Studio Ghibli films from the public API.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load films. Check the console for details.";
  }
}

function renderFilms(films) {
  filmsGrid.innerHTML = "";
  films.forEach((film) => {
    const card = document.createElement("article");
    card.className = "film-card";

    const titleEl = document.createElement("h4");
    titleEl.className = "film-title";
    titleEl.textContent = film.title;

    const metaEl = document.createElement("p");
    metaEl.className = "film-meta";
    metaEl.textContent = `Director: ${film.director} • Year: ${film.release_date} • Score: ${film.rt_score}`;

    const descEl = document.createElement("p");
    descEl.className = "film-description";
    descEl.textContent = film.description;

    card.appendChild(titleEl);
    card.appendChild(metaEl);
    card.appendChild(descEl);

    filmsGrid.appendChild(card);
  });
}

function setRandomHeroFilm() {
  if (!allFilms.length) return;
  const random = allFilms[Math.floor(Math.random() * allFilms.length)];
  heroTitle.textContent = random.title;
  heroDescription.textContent = random.description;
  heroMeta.textContent = `Director: ${random.director}  |  Producer: ${random.producer}  |  Released: ${random.release_date}`;
}

// ====== POPMOTION ANIMATIONS ======
const { styler, spring, keyframes, value, easing } = window.popmotion;

// Hero card entrance animation (spring from above + fade-in)
function animateHeroEntrance() {
  const heroStyler = styler(heroCard);
  const y = value(-80, (v) => heroStyler.set("y", v));
  const opacity = value(0, (v) => heroStyler.set("opacity", v));

  spring({
    from: -80,
    to: 0,
    stiffness: 170,
    damping: 16
  }).start(y);

  spring({
    from: 0,
    to: 1,
    stiffness: 120,
    damping: 20
  }).start(opacity);
}

// Button hover animation: scale + glow on the "Random Film" button
function setupButtonHover() {
  const btnStyler = styler(randomFilmBtn);
  let hover = false;

  randomFilmBtn.addEventListener("mouseenter", () => {
    hover = true;
    spring({
      from: 1,
      to: 1.07,
      stiffness: 230,
      damping: 15
    }).start((v) => {
      if (!hover) return;
      btnStyler.set({
        scale: v,
        boxShadow: `0 0 32px rgba(250, 204, 21, ${(v - 1) * 6})`
      });
    });
  });

  randomFilmBtn.addEventListener("mouseleave", () => {
    hover = false;
    spring({
      from: 1.07,
      to: 1,
      stiffness: 260,
      damping: 20
    }).start((v) => {
      btnStyler.set({
        scale: v,
        boxShadow: "none"
      });
    });
  });
}

// Pulse animation for the hero card using keyframes
function setupPulseAnimation() {
  const heroStyler = styler(heroCard);

  pulseBtn.addEventListener("click", () => {
    keyframes({
      values: [
        { scale: 1, boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)" },
        {
          scale: 1.03,
          boxShadow: "0 0 40px rgba(250, 204, 21, 0.7)"
        },
        { scale: 1, boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)" }
      ],
      duration: 600,
      ease: easing.easeInOut,
      loop: 2
    }).start((latest) => {
      heroStyler.set(latest);
    });
  });
}

// Click handler: random film button
function setupRandomFilmButton() {
  randomFilmBtn.addEventListener("click", () => {
    setRandomHeroFilm();
    // tiny bounce when changing film
    const heroStyler = styler(heroCard);
    spring({
      from: 1,
      to: 1.03,
      stiffness: 250,
      damping: 18
    }).start({
      update: (v) => heroStyler.set("scale", v),
      complete: () =>
        spring({
          from: 1.03,
          to: 1,
          stiffness: 260,
          damping: 20
        }).start((v) => heroStyler.set("scale", v))
    });
  });
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  fetchFilms();          // API requirement
  animateHeroEntrance(); // Popmotion entrance animation
  setupButtonHover();    // Popmotion hover animation
  setupPulseAnimation(); // Popmotion keyframes animation
  setupRandomFilmButton();
});
