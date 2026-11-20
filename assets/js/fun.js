/* Dovča s jistotou – dovolenkové animace
   Postavičky, které občas proletí / projedou přes obrazovku.
   Vypne se samo, pokud má návštěvník v systému "omezit pohyb". */
(function () {
  "use strict";

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !Element.prototype.animate) {
    window.DSJ_FUN = { celebrate() {}, fly() {} };
    return;
  }

  /* ---------- SVG postavičky ---------- */
  const SVG = {
    parrot: `
<svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true">
  <g class="f-wing-back"><path d="M58 44C64 24 78 12 96 6c-6 13-12 25-24 38Z" fill="#0A56C9"/></g>
  <path d="M74 50c8 4 22 10 44 20-14 0-30-4-46-12Z" fill="#1E7BFF"/>
  <path d="M74 48c10 2 24 6 42 16-14-1-28-4-44-10Z" fill="#E63946"/>
  <path d="M72 52c8 6 18 12 32 22-12-2-24-8-34-16Z" fill="#FFC23C"/>
  <ellipse cx="56" cy="48" rx="22" ry="13" transform="rotate(-12 56 48)" fill="#E63946"/>
  <path d="M44 56c6 4 16 5 24 1-6 7-18 8-24-1Z" fill="#C62835"/>
  <circle cx="34" cy="38" r="12" fill="#E63946"/>
  <ellipse cx="30" cy="39" rx="6" ry="5.5" fill="#fff"/>
  <path d="M27.5 37.5c1-.8 2.4-.8 3.4 0M27 41c1.2.6 2.6.6 3.8 0" stroke="#d8d8d8" stroke-width=".8" fill="none"/>
  <circle cx="31" cy="37.5" r="2.2" fill="#0A2540"/><circle cx="31.7" cy="36.8" r=".7" fill="#fff"/>
  <path d="M24 34c-8 0-12 6-10 13 2-4 5-6 9-5Z" fill="#F4E9D2"/>
  <path d="M15 46c2 2 5 3 9 1l-1-4c-3 0-6 1-8 3Z" fill="#2B2B2B"/>
  <g class="f-wing"><path d="M52 46C58 24 72 8 92 0c-4 10-8 20-14 28-6 8-14 14-24 20Z" fill="#1E7BFF"/>
    <path d="M52 46c4-14 12-24 22-32-2 10-8 20-16 30Z" fill="#FFC23C"/>
    <path d="M52 46c2-8 6-14 12-20 0 7-4 14-10 20Z" fill="#E63946"/></g>
</svg>`,

    skier: `
<svg viewBox="0 0 130 100" width="130" height="100" aria-hidden="true">
  <g class="f-spray" fill="#fff" stroke="#BFE0FF" stroke-width="1">
    <circle cx="14" cy="80" r="5"/><circle cx="4" cy="72" r="4"/><circle cx="20" cy="68" r="3"/><circle cx="8" cy="86" r="3.5"/>
  </g>
  <path d="M60 44c-10 2-20 0-30-6" class="f-scarf" stroke="#E63946" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M20 84h88c6 0 9-3 10-7" stroke="#0A2540" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M26 90h82c6 0 9-3 10-7" stroke="#0A2540" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".75"/>
  <path d="M52 60l14 8-8 14" stroke="#16365F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M52 60l20 4-4 18" stroke="#0A2540" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M52 60l10-20" stroke="#1E7BFF" stroke-width="13" stroke-linecap="round"/>
  <path d="M62 44l12 10" stroke="#1E7BFF" stroke-width="6" stroke-linecap="round"/>
  <path d="M74 54L40 88" stroke="#6C7A90" stroke-width="2" stroke-linecap="round"/>
  <circle cx="74" cy="54" r="3.5" fill="#0A2540"/>
  <circle cx="68" cy="30" r="8" fill="#F6C9A0"/>
  <path d="M59 30a9 9 0 0 1 18-2Z" fill="#FFB22E"/>
  <rect x="68" y="27" width="10" height="5" rx="2.5" fill="#4DB3FF" stroke="#0A2540" stroke-width="1"/>
</svg>`,

    plane: `
<svg viewBox="0 0 340 70" width="340" height="70" aria-hidden="true">
  <g class="f-banner">
    <path d="M6 18h196l-8 17 8 17H6c4-5 6-11 6-17S10 23 6 18Z" fill="#fff" stroke="#BFE0FF" stroke-width="2"/>
    <text x="104" y="40" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-weight="800" font-size="16" fill="#0A56C9">Dovča s jistotou ☀</text>
  </g>
  <path d="M202 35h40" stroke="#6C7A90" stroke-width="1.5"/>
  <g transform="translate(240 14)">
    <path d="M4 22h70c8 0 14 4 14 8s-6 6-14 6H10L0 14h6Z" fill="#fff"/>
    <path d="M4 22h70c8 0 14 4 14 8H6Z" fill="#E3F0FF"/>
    <path d="M34 26L22 4h9l22 22Z" fill="#1E7BFF"/>
    <path d="M36 32L26 50h9l18-18Z" fill="#0A56C9"/>
    <path d="M0 14h8l8 10H4Z" fill="#1E7BFF"/>
    <g fill="#4DB3FF"><circle cx="50" cy="28" r="2"/><circle cx="58" cy="28" r="2"/><circle cx="66" cy="28" r="2"/></g>
    <path d="M76 23c4 0 7 2 8 5h-8Z" fill="#0A2540" opacity=".6"/>
    <g class="f-prop"><ellipse cx="89" cy="30" rx="2" ry="12" fill="#6C7A90" opacity=".6"/></g>
  </g>
</svg>`,

    balloon: `
<svg viewBox="0 0 100 150" width="90" height="135" aria-hidden="true">
  <defs><clipPath id="bl-c"><path d="M50 4C22 4 6 24 6 46c0 24 22 42 32 60h24c10-18 32-36 32-60C94 24 78 4 50 4Z"/></clipPath></defs>
  <path d="M50 4C22 4 6 24 6 46c0 24 22 42 32 60h24c10-18 32-36 32-60C94 24 78 4 50 4Z" fill="#fff"/>
  <g clip-path="url(#bl-c)">
    <path d="M50 0c-14 20-18 60-10 110h-8C20 70 18 30 30 0Z M50 0c14 20 18 60 10 110h8C80 70 82 30 70 0Z" fill="#1E7BFF"/>
    <path d="M0 0c4 30 16 70 32 110H0Z M100 0c-4 30-16 70-32 110h32Z" fill="#0A56C9"/>
    <rect x="0" y="40" width="100" height="10" fill="#FFC23C" opacity=".95"/>
  </g>
  <path d="M38 106l4 18M62 106l-4 18" stroke="#8C5A2D" stroke-width="1.5"/>
  <rect x="40" y="122" width="20" height="16" rx="3" fill="#B9824B"/>
  <rect x="40" y="122" width="20" height="4" rx="2" fill="#8C5A2D"/>
  <circle cx="46" cy="118" r="3" fill="#F6C9A0"/><circle cx="54" cy="118" r="3" fill="#F6C9A0"/>
</svg>`,

    crab: `
<svg viewBox="0 0 100 70" width="84" height="59" aria-hidden="true">
  <g class="f-legs" stroke="#E2553A" stroke-width="4" stroke-linecap="round" fill="none">
    <path d="M30 44l-14 8-4 10M32 48l-10 10-2 8M68 44l14 8 4 10M66 48l10 10 2 8"/>
  </g>
  <g class="f-claw-l"><path d="M28 36L14 26" stroke="#E2553A" stroke-width="5" stroke-linecap="round"/><path d="M14 26c-10-2-14-12-8-18 2 6 6 8 12 8-6 2-6 6-4 10Z" fill="#FF6B4A"/></g>
  <g class="f-claw-r"><path d="M72 36l14-10" stroke="#E2553A" stroke-width="5" stroke-linecap="round"/><path d="M86 26c10-2 14-12 8-18-2 6-6 8-12 8 6 2 6 6 4 10Z" fill="#FF6B4A"/></g>
  <ellipse cx="50" cy="42" rx="26" ry="16" fill="#FF6B4A"/>
  <path d="M30 40c10 8 30 8 40 0" stroke="#E2553A" stroke-width="2" fill="none"/>
  <path d="M42 28v-10M58 28v-10" stroke="#E2553A" stroke-width="3" stroke-linecap="round"/>
  <circle cx="42" cy="16" r="5" fill="#fff"/><circle cx="58" cy="16" r="5" fill="#fff"/>
  <circle class="f-eye" cx="43" cy="16" r="2.4" fill="#0A2540"/><circle class="f-eye" cx="59" cy="16" r="2.4" fill="#0A2540"/>
  <path d="M45 46q5 4 10 0" stroke="#0A2540" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`,

    dolphin: `
<svg viewBox="0 0 120 60" width="130" height="65" aria-hidden="true">
  <path d="M8 34C18 18 46 10 74 16c10 2 18 6 24 10l14-2c-2 4-6 6-10 7 2 3 2 6 0 8-10 4-30 8-52 8-12 0-22-2-30-6L4 50c0-6 2-12 4-16Z" fill="#2D6BD8"/>
  <path d="M30 44c16 4 46 2 68-6-8 8-34 14-54 12-6 0-12-2-14-6Z" fill="#BFE0FF"/>
  <path d="M52 14c2-8 8-12 16-12-4 4-6 8-6 14Z" fill="#2D6BD8"/>
  <path d="M8 34L-2 26c4 0 8 2 10 4L2 40Z" fill="#2D6BD8"/>
  <circle cx="92" cy="28" r="2" fill="#0A2540"/><circle cx="92.6" cy="27.4" r=".6" fill="#fff"/>
  <path d="M100 34q3 2 6 1" stroke="#0A2540" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>`,
  };

  /* ---------- dráhy (keyframes podle velikosti okna) ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const sample = (n, fn) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
  const tf = (x, y, r = 0, s = 1) => ({ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})` });

  const ACTORS = {
    parrot: {
      duration: () => rnd(8500, 11000),
      frames(W, H) {
        const y0 = rnd(H * 0.12, H * 0.35);
        const amp = rnd(20, 40);
        return sample(40, (t) => tf(W + 40 - t * (W + 220), y0 + Math.sin(t * Math.PI * 3) * amp + t * 30, Math.cos(t * Math.PI * 3) * 8));
      },
    },
    skier: {
      duration: () => rnd(4200, 5200),
      frames(W, H) {
        const y0 = rnd(H * 0.08, H * 0.25);
        const y1 = y0 + rnd(H * 0.35, H * 0.5);
        const ang = (Math.atan2(y1 - y0, W + 300) * 180) / Math.PI;
        return sample(30, (t) => tf(-150 + t * (W + 300), y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 5) * 6, ang + Math.sin(t * Math.PI * 5) * 3));
      },
      easing: "cubic-bezier(.45,.05,.75,.9)",
    },
    plane: {
      duration: () => rnd(13000, 16000),
      frames(W, H) {
        const y0 = rnd(H * 0.1, H * 0.22);
        return sample(30, (t) => tf(-360 + t * (W + 400), y0 + Math.sin(t * Math.PI * 2) * 12 - t * 20, Math.cos(t * Math.PI * 2) * -2));
      },
    },
    balloon: {
      duration: () => rnd(16000, 20000),
      frames(W, H) {
        const x0 = Math.random() < 0.5 ? rnd(W * 0.02, W * 0.15) : rnd(W * 0.8, W * 0.9);
        return sample(40, (t) => tf(x0 + Math.sin(t * Math.PI * 2) * 40 + t * 40, H + 40 - t * (H + 240), Math.sin(t * Math.PI * 4) * 4));
      },
    },
    crab: {
      duration: () => rnd(9000, 11000),
      frames(W, H) {
        const rtl = Math.random() < 0.5;
        return sample(40, (t) => {
          const p = rtl ? 1 - t : t;
          // chvilku se zastaví uprostřed a rozhlédne se
          const q = p < 0.45 ? p : p < 0.55 ? 0.45 + (p - 0.45) * 0.15 : p - 0.085;
          return tf(-100 + q * 1.09 * (W + 200), H - 66 + Math.abs(Math.sin(t * Math.PI * 16)) * -4, Math.sin(t * Math.PI * 16) * 3);
        });
      },
    },
    dolphin: {
      duration: () => rnd(2600, 3200),
      frames(W, H) {
        const x0 = rnd(W * 0.15, W * 0.55);
        const h = rnd(160, 240);
        return sample(30, (t) => tf(x0 + t * 320, H + 20 - Math.sin(t * Math.PI) * h, -50 + t * 110));
      },
      easing: "linear",
    },
  };

  /* ---------- vrstva a spouštění ---------- */
  const layer = document.createElement("div");
  layer.className = "fun-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);
  const front = document.createElement("div");
  front.className = "fun-layer fun-front";
  front.setAttribute("aria-hidden", "true");
  document.body.appendChild(front);

  let busy = 0;
  let last = null;

  function fly(name) {
    const a = ACTORS[name];
    if (!a || document.hidden) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const el = document.createElement("div");
    el.className = "flyer flyer-" + name;
    el.innerHTML = SVG[name];
    layer.appendChild(el);
    busy++;
    const anim = el.animate(a.frames(W, H), { duration: a.duration(), easing: a.easing || "linear", fill: "forwards" });
    anim.onfinish = anim.oncancel = () => {
      el.remove();
      busy--;
    };
    last = name;
  }

  const ROTATION = ["parrot", "plane", "skier", "balloon", "dolphin", "crab", "parrot", "skier"];
  function pick() {
    const pool = ROTATION.filter((n) => n !== last);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function loop() {
    if (!document.hidden && busy < 2) fly(pick());
    setTimeout(loop, rnd(11000, 17000));
  }

  /* Konkrétní postavička, když návštěvník doroluje do sekce */
  const triggers = [
    ["#pro-koho", "parrot"],
    ["#destinace", "skier"],
    ["#faq", "dolphin"],
    [".site-footer", "crab"],
  ];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const t = triggers.find(([sel]) => en.target.matches(sel));
          io.unobserve(en.target);
          if (t && busy < 2) fly(t[1]);
        }),
      { threshold: 0.35 }
    );
    triggers.forEach(([sel]) => {
      const el = document.querySelector(sel);
      if (el) io.observe(el);
    });
  }

  setTimeout(() => fly("parrot"), 2200);
  setTimeout(loop, 14000);

  /* ---------- oslava u výsledků ---------- */
  function celebrate(target) {
    const box = (target || document.body).getBoundingClientRect();
    const colors = ["#1E7BFF", "#4DB3FF", "#FFC23C", "#FFB22E", "#0A56C9", "#fff", "#FF8A5B"];
    const shapes = ["", "round", "leaf"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("i");
      c.className = "confetti " + shapes[i % 3];
      c.style.background = colors[i % colors.length];
      c.style.left = box.left + box.width / 2 + "px";
      c.style.top = Math.max(box.top, 0) + 40 + "px";
      front.appendChild(c);
      const dx = rnd(-1, 1) * Math.min(box.width * 0.6, 520);
      const dy = rnd(-260, -120);
      const fall = rnd(260, 520);
      const rot = rnd(-720, 720);
      c.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: `translate(${dx * 0.7}px, ${dy}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${dx}px, ${dy + fall}px) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: rnd(1600, 2400), easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" }
      ).onfinish = () => c.remove();
    }
    setTimeout(() => busy < 2 && fly("plane"), 900);
  }

  window.DSJ_FUN = { celebrate, fly };
})();
