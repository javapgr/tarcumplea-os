const flowerBtn = document.querySelector("#flowerBtn");
const introMsg = document.querySelector("#introMsg");
const intro = document.querySelector("#intro");
const cards = document.querySelector("#cards");
const cake = document.querySelector("#cake");
const heartFx = document.querySelector("#heartFx");
const cardsFx = document.querySelector("#cardsFx");
const cakeFx = document.querySelector("#cakeFx");
const toCakeBtn = document.querySelector("#toCakeBtn");
const backPhotosBtn = document.querySelector("#backPhotosBtn");
const candleBtn = document.querySelector("#candleBtn");
const candle = document.querySelector("#candle");
const cakeMsg = document.querySelector("#cakeMsg");
const musicBtn = document.querySelector("#musicBtn");

const YT_ID = "40AJMQob25o";

let step = 0;
let cardsFxTimer = null;
let ytPlayer = null;
let musicReady = false;
let musicStarted = false;
let musicMuted = false;

function loadYouTubeApi() {
  if (window.YT?.Player) {
    createYtPlayer();
    return;
  }
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = createYtPlayer;
}

function createYtPlayer() {
  ytPlayer = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
    videoId: YT_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      loop: 1,
      playlist: YT_ID,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        musicReady = true;
      },
      onStateChange: (e) => {
        // si termina, volver a poner en loop
        if (e.data === YT.PlayerState.ENDED) {
          ytPlayer.seekTo(0);
          ytPlayer.playVideo();
        }
      },
    },
  });
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  musicBtn.hidden = false;
  const play = () => {
    if (!ytPlayer?.playVideo) return false;
    ytPlayer.unMute();
    ytPlayer.setVolume(80);
    ytPlayer.playVideo();
    musicMuted = false;
    musicBtn.classList.remove("is-muted");
    musicBtn.textContent = "♪";
    return true;
  };
  if (!play()) {
    const wait = setInterval(() => {
      if (musicReady && play()) clearInterval(wait);
    }, 120);
    setTimeout(() => clearInterval(wait), 8000);
  }
}

musicBtn?.addEventListener("click", () => {
  if (!ytPlayer) return;
  musicMuted = !musicMuted;
  if (musicMuted) {
    ytPlayer.mute();
    musicBtn.classList.add("is-muted");
    musicBtn.textContent = "🔇";
  } else {
    ytPlayer.unMute();
    ytPlayer.playVideo();
    musicBtn.classList.remove("is-muted");
    musicBtn.textContent = "♪";
  }
});

loadYouTubeApi();

function setMsg(text) {
  introMsg.classList.remove("is-pop");
  void introMsg.offsetWidth;
  introMsg.textContent = text;
  introMsg.classList.add("is-pop");
}

function burstOrigin() {
  const introBox = intro.getBoundingClientRect();
  const flowerBox = flowerBtn.getBoundingClientRect();
  return {
    x: flowerBox.left + flowerBox.width / 2 - introBox.left,
    y: flowerBox.top + flowerBox.height * 0.38 - introBox.top,
  };
}

function spawnBurstItem({
  layer,
  origin,
  className,
  src,
  size,
  angle,
  dist,
  delay,
  dur,
  rot,
}) {
  const el = document.createElement("img");
  el.className = className;
  el.src = src;
  el.alt = "";
  el.draggable = false;
  el.style.setProperty("--x", `${origin.x}px`);
  el.style.setProperty("--y", `${origin.y}px`);
  el.style.setProperty("--dx", `${Math.round(Math.cos(angle) * dist)}px`);
  el.style.setProperty("--dy", `${Math.round(Math.sin(angle) * dist)}px`);
  el.style.setProperty("--s", `${size}px`);
  el.style.setProperty("--delay", `${delay}s`);
  el.style.setProperty("--dur", `${dur}s`);
  el.style.setProperty("--rot", `${rot}deg`);
  layer.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

/** Corazones en ola desde el centro de la flor. */
function spawnPixelHearts(count = 80) {
  if (!heartFx || !flowerBtn) return;
  const origin = burstOrigin();
  const rings = 6;
  const perRing = Math.ceil(count / rings);

  for (let ring = 0; ring < rings; ring++) {
    for (let i = 0; i < perRing; i++) {
      const angle =
        (i / perRing) * Math.PI * 2 +
        ring * 0.28 +
        (Math.random() - 0.5) * 0.4;
      spawnBurstItem({
        layer: heartFx,
        origin,
        className: "px-burst",
        src: "heart.webp",
        size: 16 + Math.floor(Math.random() * 28),
        angle,
        dist: 55 + ring * 48 + Math.random() * 50,
        delay: ring * 0.05 + Math.random() * 0.06,
        dur: 0.8 + Math.random() * 0.55,
        rot: Math.round((Math.random() - 0.5) * 50),
      });
    }
  }
}

const FLOWER_SRCS = ["flor-morada.webp", "girasol.webp", "rosa.webp"];

/** Flores: aparecen, salen y desaparecen. */
function spawnPurpleFlowers(count = 36, layer = heartFx, origin = null) {
  if (!layer) return;
  const center = origin || burstOrigin();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
    spawnBurstItem({
      layer,
      origin: center,
      className: "flower-burst",
      src: FLOWER_SRCS[i % FLOWER_SRCS.length],
      size: 26 + Math.floor(Math.random() * 42),
      angle,
      dist: 70 + Math.random() * 150,
      delay: Math.random() * 0.35,
      dur: 1.05 + Math.random() * 0.6,
      rot: Math.round((Math.random() - 0.5) * 90),
    });
  }
}

function spawnCardsAmbient() {
  if (!cardsFx || cards.hidden) return;
  const box = cards.getBoundingClientRect();
  const origin = {
    x: box.width * (0.2 + Math.random() * 0.6),
    y: box.height * (0.15 + Math.random() * 0.7),
  };
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    spawnBurstItem({
      layer: cardsFx,
      origin,
      className: "flower-burst",
      src: FLOWER_SRCS[Math.floor(Math.random() * FLOWER_SRCS.length)],
      size: 22 + Math.floor(Math.random() * 30),
      angle,
      dist: 40 + Math.random() * 90,
      delay: Math.random() * 0.2,
      dur: 1.4 + Math.random() * 0.7,
      rot: Math.round((Math.random() - 0.5) * 70),
    });
  }
}

function startCardsFx() {
  if (cardsFxTimer) return;
  spawnPurpleFlowers(18, cardsFx, {
    x: cards.clientWidth / 2,
    y: 120,
  });
  cardsFxTimer = setInterval(spawnCardsAmbient, 2200);
}

flowerBtn.addEventListener("click", () => {
  startMusic();
  spawnPixelHearts(step === 0 ? 90 : 70);
  spawnPurpleFlowers(step === 0 ? 42 : 32);

  if (step === 0) {
    flowerBtn.classList.add("is-love");
    setMsg("te amo mamá ♥");
    step = 1;
    return;
  }

  if (step === 1) {
    setMsg("Feliz Cumpleaños");
    step = 2;
    setTimeout(() => {
      showScreen(cards);
    }, 900);
  }
});

function showScreen(target) {
  intro.hidden = target !== intro;
  cards.hidden = target !== cards;
  cake.hidden = target !== cake;
  if (target === cards) startCardsFx();
}

const CONFETTI_COLORS = [
  "#ff4d6d",
  "#ffd166",
  "#06d6a0",
  "#4cc9f0",
  "#f72585",
  "#ffe66d",
  "#b5179e",
];

function spawnCakeCelebration() {
  if (!cakeFx || !cake) return;
  const w = cake.clientWidth;
  const h = cake.clientHeight;
  const origin = { x: w / 2, y: h * 0.55 };

  // muchos globos de corazón subiendo
  for (let i = 0; i < 22; i++) {
    const el = document.createElement("img");
    el.className = "balloon";
    el.src = "globo.webp";
    el.alt = "";
    el.draggable = false;
    const startX = w * (0.08 + Math.random() * 0.84);
    const startY = h * (0.45 + Math.random() * 0.35);
    el.style.setProperty("--x", `${startX}px`);
    el.style.setProperty("--y", `${startY}px`);
    el.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 90)}px`);
    el.style.setProperty("--dy", `${Math.round(Math.random() * 40)}px`);
    el.style.setProperty("--s", `${48 + Math.floor(Math.random() * 70)}px`);
    el.style.setProperty("--delay", `${Math.random() * 0.55}s`);
    el.style.setProperty("--dur", `${2.8 + Math.random() * 2.2}s`);
    el.style.setProperty("--rot", `${Math.round((Math.random() - 0.5) * 28)}deg`);
    cakeFx.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  // confeti cayendo
  for (let i = 0; i < 70; i++) {
    const bit = document.createElement("span");
    bit.className = "confetti";
    bit.style.setProperty("--x", `${Math.random() * w}px`);
    bit.style.setProperty("--y", `${-10 - Math.random() * 40}px`);
    bit.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 120)}px`);
    bit.style.setProperty("--dy", `${Math.round(Math.random() * 40)}px`);
    bit.style.setProperty("--s", `${6 + Math.floor(Math.random() * 8)}px`);
    bit.style.setProperty("--delay", `${Math.random() * 0.7}s`);
    bit.style.setProperty("--dur", `${2.2 + Math.random() * 1.8}s`);
    bit.style.setProperty("--rot", `${Math.round(Math.random() * 720)}deg`);
    bit.style.setProperty("--c", CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
    cakeFx.appendChild(bit);
    bit.addEventListener("animationend", () => bit.remove());
  }

  // corazones y flores alrededor del pastel
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const isHeart = i % 2 === 0;
    spawnBurstItem({
      layer: cakeFx,
      origin,
      className: isHeart ? "px-burst" : "flower-burst",
      src: isHeart ? "heart.webp" : FLOWER_SRCS[i % FLOWER_SRCS.length],
      size: isHeart
        ? 16 + Math.floor(Math.random() * 18)
        : 22 + Math.floor(Math.random() * 26),
      angle,
      dist: 50 + Math.random() * 110,
      delay: Math.random() * 0.2,
      dur: 1 + Math.random() * 0.5,
      rot: Math.round((Math.random() - 0.5) * 50),
    });
  }
}

toCakeBtn?.addEventListener("click", () => {
  showScreen(cake);
  if (!candle.classList.contains("lit")) candle.classList.add("lit");
  cakeMsg.textContent = "toca la vela para apagar";
});

backPhotosBtn?.addEventListener("click", () => {
  showScreen(cards);
});

candleBtn?.addEventListener("click", () => {
  const lit = candle.classList.toggle("lit");
  if (lit) {
    cakeMsg.textContent = "toca la vela para apagar";
  } else {
    cakeMsg.textContent = "¡feliz cumpleaños mamá! ♥";
    spawnCakeCelebration();
  }
});

setTimeout(() => {
  if (step === 0) {
    flowerBtn.classList.add("is-love");
  }
}, 1400);

document.querySelectorAll(".polaroid").forEach((card) => {
  const shot = card.querySelector(".shot");
  const photo = shot?.querySelector("img");
  const input = card.querySelector("input");

  photo?.addEventListener("error", () => {
    photo.remove();
    shot?.classList.add("empty");
  });

  input?.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;

    let img = shot.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      img.alt = "Foto de mamá";
      shot.prepend(img);
    }

    shot.classList.remove("empty");
    const url = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(url);
    img.src = url;
  });
});
