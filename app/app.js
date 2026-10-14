"use strict";
const SYMBOLS = ["🍎", "🐙", "🚀", "🌵", "🎸", "🦊", "🍩", "⚽", "🌈", "🐢", "🎈", "🍉", "🦋", "🔑", "🎲", "🌻"];
const NAMES = { "🍎": "apple", "🐙": "octopus", "🚀": "rocket", "🌵": "cactus", "🎸": "guitar", "🦊": "fox", "🍩": "doughnut", "⚽": "football", "🌈": "rainbow", "🐢": "turtle", "🎈": "balloon", "🍉": "watermelon", "🦋": "butterfly", "🔑": "key", "🎲": "dice", "🌻": "sunflower" };
const boardEl = document.getElementById("board");
const sizeEl = document.getElementById("size");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const bestEl = document.getElementById("best");
const msg = document.getElementById("msg");

let deck, up, moves, found, busy;

function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
function save(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } }

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newGame() {
  const pairs = Number(sizeEl.value);
  const picks = shuffle([...SYMBOLS]).slice(0, pairs);
  deck = shuffle([...picks, ...picks]);
  up = [];
  moves = 0;
  found = 0;
  busy = false;
  msg.textContent = "";
  boardEl.style.gridTemplateColumns = `repeat(${pairs === 6 ? 4 : pairs === 8 ? 4 : 6}, 1fr)`;
  boardEl.replaceChildren(
    ...deck.map((s, i) => {
      const b = document.createElement("button");
      b.className = "card";
      b.dataset.i = i;
      b.setAttribute("aria-label", "Hidden card");
      b.innerHTML = `<span class="inner"><span class="face back"></span><span class="face front" aria-hidden="true">${s}</span></span>`;
      return b;
    }),
  );
  showBest();
  update();
}

function showBest() {
  bestEl.textContent = load(`memory-best-${sizeEl.value}`) || "–";
}

function flip(b) {
  if (busy || b.classList.contains("up")) return;
  b.classList.add("up");
  b.setAttribute("aria-label", NAMES[deck[b.dataset.i]]);
  up.push(b);
  if (up.length < 2) return;
  moves++;
  const [a, c] = up;
  if (deck[a.dataset.i] === deck[c.dataset.i]) {
    a.classList.add("done");
    c.classList.add("done");
    a.disabled = c.disabled = true;
    up = [];
    found++;
    if (found === deck.length / 2) finish();
  } else {
    busy = true;
    setTimeout(() => {
      for (const x of up) {
        x.classList.remove("up");
        x.setAttribute("aria-label", "Hidden card");
      }
      up = [];
      busy = false;
    }, 800);
  }
  update();
}

function finish() {
  const key = `memory-best-${sizeEl.value}`;
  const best = Number(load(key)) || Infinity;
  if (moves < best) save(key, String(moves));
  msg.textContent = moves < best ? `All pairs in ${moves} moves. New best!` : `All pairs in ${moves} moves.`;
  showBest();
}

function update() {
  movesEl.textContent = moves;
  pairsEl.textContent = `${found}/${deck.length / 2}`;
}

boardEl.addEventListener("click", (e) => {
  const b = e.target.closest(".card");
  if (b && !b.disabled) flip(b);
});
document.getElementById("new").addEventListener("click", newGame);
sizeEl.addEventListener("change", newGame);
newGame();
