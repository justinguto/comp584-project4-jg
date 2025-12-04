// ====== POKÉAPI FETCH + RENDER ======
const pokemonGrid = document.getElementById("pokemon-grid");
const statusEl = document.getElementById("status");
const shuffleBtn = document.getElementById("shuffle-btn");
const heroCard = document.getElementById("hero-card");

// Helper: extract ID from URL like "https://pokeapi.co/api/v2/pokemon/1/"
function getPokemonIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean); // removes empty strings
  return parts[parts.length - 1];
}

async function fetchPokemonList(limit = 12, offset = 0) {
  statusEl.textContent = "Loading Pokémon...";
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    renderPokemon(data.results);
    statusEl.textContent = `Showing ${data.results.length} Pokémon.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load Pokémon. Check console for details.";
  }
}

function renderPokemon(pokemonList) {
  pokemonGrid.innerHTML = "";
  pokemonList.forEach((p) => {
    const id = getPokemonIdFromUrl(p.url);
    const card = document.createElement("article");
    card.className = "pokemon-card";

    const img = document.createElement("img");
    img.src =
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    img.alt = p.name;

    const name = document.createElement("h4");
    name.className = "pokemon-name";
    name.textContent = p.name;

    const idLine = document.createElement("p");
    idLine.className = "pokemon-id";
    idLine.textContent = `#${id.padStart(3, "0")}`;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(idLine);
    pokemonGrid.appendChild(card);
  });
}

// ====== POPMOTION ANIMATIONS (older library) ======
const { styler, spring, value, easing } = window.popmotion;

// Hero card slide-in animation
function animateHeroIn() {
  const heroStyler = styler(heroCard);
  const y = value(-80, (v) => heroStyler.set("y", v));
  const opacity = value(0, (v) => heroStyler.set("opacity", v));

  spring({
    from: -80,
    to: 0,
    stiffness: 170,
    damping: 14
  }).start(y);

  spring({
    from: 0,
    to: 1,
    stiffness: 120,
    damping: 18
  }).start(opacity);
}

// Button hover animation: subtle scale & glow
function setupButtonAnimation() {
  const btnStyler = styler(shuffleBtn);
  let isHovering = false;

  shuffleBtn.addEventListener("mouseenter", () => {
    isHovering = true;
    spring({
      from: 1,
      to: 1.07,
      stiffness: 200,
      damping: 15
    }).start((v) => {
      if (!isHovering) return;
      btnStyler.set({
        scale: v,
        boxShadow: `0 0 30px rgba(255, 204, 0, ${0.6 * (v - 0.9)})`
      });
    });
  });

  shuffleBtn.addEventListener("mouseleave", () => {
    isHovering = false;
    spring({
      from: 1.07,
      to: 1,
      stiffness: 250,
      damping: 20
    }).start((v) => {
      btnStyler.set({
        scale: v,
        boxShadow: "none"
      });
    });
  });
}

// Shuffle animation: wiggle cards + refetch different offset
function setupShuffle() {
  shuffleBtn.addEventListener("click", () => {
    const cards = Array.from(document.querySelectorAll(".pokemon-card"));
    const cardStylers = cards.map((c) => styler(c));

    cardStylers.forEach((s, index) => {
      spring({
        from: 0,
        to: 1,
        stiffness: 250,
        damping: 15,
        mass: 0.9
      }).start((v) => {
        const offset = Math.sin(v * Math.PI * 2 + index) * 4;
        s.set({
          y: offset,
          scale: 1 + 0.02 * Math.sin(v * Math.PI + index)
        });
      });
    });

    // After a tiny timeout, load a new “page” of Pokémon
    const randomOffset = Math.floor(Math.random() * 10) * 12; // multiples of 12
    setTimeout(() => {
      fetchPokemonList(12, randomOffset);
    }, 250);
  });
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  fetchPokemonList();
  animateHeroIn();
  setupButtonAnimation();
  setupShuffle();
});
