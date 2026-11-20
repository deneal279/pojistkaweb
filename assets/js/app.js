/* Dovča s jistotou – dotazník, výpočet a doporučení pojištění */
(function () {
  "use strict";

  const CFG = window.DSJ_CONFIG;
  const PRODUCTS = window.DSJ_PRODUCTS;
  const STORAGE_KEY = "dsj-answers-v1";
  const TOTAL_STEPS = 4;

  const PARTY_DEFAULTS = {
    solo: { adults: 1, kids: 0 },
    couple: { adults: 2, kids: 0 },
    family: { adults: 2, kids: 2 },
    group: { adults: 5, kids: 0 },
  };

  const LABELS = {
    region: { europe: "Evropa", world: "Svět (mimo USA a Kanadu)", usa: "Celý svět vč. USA a Kanady" },
    activities: {
      relax: "pláž a relax",
      hiking: "turistika",
      cycling: "cyklistika",
      ski: "lyže a snowboard",
      diving: "potápění",
      water: "vodní sporty",
      adrenaline: "adrenalinové sporty",
      motor: "skútr a motorka",
    },
  };

  const defaults = () => ({
    party: null,
    adults: 2,
    kids: 0,
    age: null,
    region: null,
    days: 7,
    frequency: "1",
    activities: [],
    needs: [],
    budget: "balanced",
  });

  let state = defaults();
  let step = 1;

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
  const kc = (n) => fmt.format(Math.round(n / 10) * 10) + " Kč";
  const limit = (n) =>
    n === Infinity ? "neomezeně" : n >= 1000000 ? fmt.format(n / 1000000) + " mil. Kč" : n > 0 ? fmt.format(n) + " Kč" : "nekryto";
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable – ignore */
    }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = Object.assign(defaults(), JSON.parse(raw));
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------- pricing & scoring ---------- */
  function tripsPerYear() {
    return { 1: 1, 2: 2, "3+": 4 }[state.frequency] || 1;
  }

  function quote(p) {
    const s = state;
    const kidsF = p.kidsFactor ?? CFG.defaultKidsFactor;
    const units = s.adults + s.kids * kidsF;
    const persons = s.adults + s.kids;
    const ageF = CFG.ageFactor[s.age] || 1;
    const acts = s.activities.length ? s.activities : ["relax"];

    const uncovered = acts.filter((a) => p.sports[a] === undefined);
    const sportMult = Math.max(1, ...acts.map((a) => p.sports[a] || 1));
    const surcharged = acts.filter((a) => (p.sports[a] || 1) > 1);

    let price, yearly;
    if (p.annual) {
      price = p.annual[s.region] * units * ageF * sportMult;
      yearly = price;
    } else {
      price = p.pricePerDay[s.region] * s.days * units * ageF * sportMult;
      if (p.groupDiscount && persons >= p.groupDiscount.minPersons) price *= 1 - p.groupDiscount.discount;
      yearly = price * tripsPerYear();
    }
    return { price, yearly, uncovered, surcharged, persons };
  }

  function quality(p) {
    let q = 0;
    q += p.medicalLimit === Infinity ? 0.25 : Math.min(p.medicalLimit / 5e6, 1) * 0.2;
    q += Math.min(p.liability / 5e6, 1) * 0.15;
    q += Math.min(p.luggage / 60000, 1) * 0.15;
    q += p.cancellation ? 0.2 : 0;
    q += p.carRental ? 0.1 : 0;
    q += p.rescue === Infinity ? 0.1 : Math.min(p.rescue / 1.5e6, 1) * 0.08;
    q += p.chronic ? 0.05 : 0;
    return q; // 0 – 1
  }

  function evaluate() {
    const s = state;
    const persons = s.adults + s.kids;
    const needs = new Set(s.needs);
    const acts = s.activities.length ? s.activities : ["relax"];

    let rows = PRODUCTS.map((p) => ({ p, q: quote(p) })).filter(
      ({ p }) => !(s.age === "61+" && p.maxAge < 65)
    );

    const yearlies = rows.map((r) => r.q.yearly);
    const minY = Math.min(...yearlies);
    const maxY = Math.max(...yearlies);
    const wPrice = { cheap: 34, balanced: 16, max: 4 }[s.budget];
    const wQual = { cheap: 4, balanced: 12, max: 26 }[s.budget];

    rows = rows.map(({ p, q }) => {
      let score = 82;
      const pros = [];
      const cons = [];

      // aktivity
      q.uncovered.forEach((a) => {
        score -= 34;
        cons.push(`Nekryje ${LABELS.activities[a]}`);
      });
      const coveredActs = acts.filter((a) => a !== "relax" && p.sports[a] !== undefined);
      if (coveredActs.length && !q.uncovered.length)
        pros.push(`Kryje ${coveredActs.map((a) => LABELS.activities[a]).join(", ")}`);
      if (q.surcharged.length && !q.uncovered.length)
        cons.push(`Za ${q.surcharged.map((a) => LABELS.activities[a]).join(", ")} se platí příplatek (už je v ceně)`);

      // destinace
      if (s.region === "usa" && p.medicalLimit !== Infinity) {
        score -= 16;
        cons.push("Do USA doporučujeme neomezené léčebné výlohy");
      } else if (s.region === "world" && p.medicalLimit < 5e6) {
        score -= 7;
        cons.push("Nižší limit léčebných výloh pro vzdálené destinace");
      }
      if (p.medicalLimit === Infinity) pros.push("Neomezené léčebné výlohy");

      if ((acts.includes("ski") || acts.includes("hiking")) && p.rescue < 1e6) {
        score -= 8;
        cons.push("Nízký limit na horskou službu");
      } else if (acts.includes("ski") && p.rescue === Infinity) {
        pros.push("Horská služba i vrtulník bez limitu");
      }

      // potřeby
      if (needs.has("cancellation")) {
        if (p.cancellation) pros.push(`Storno cesty (${p.cancellation.percent} %, až ${limit(p.cancellation.limit)})`);
        else (score -= 20), cons.push("Neobsahuje storno cesty");
      }
      if (needs.has("luggage")) {
        if (p.luggage >= 30000) pros.push(`Zavazadla do ${limit(p.luggage)}`);
        else if (p.luggage > 0) (score -= 6), cons.push(`Zavazadla jen do ${limit(p.luggage)}`);
        else (score -= 15), cons.push("Nekryje zavazadla");
      }
      if (needs.has("car")) {
        if (p.carRental) pros.push("Spoluúčast u půjčeného auta");
        else (score -= 14), cons.push("Nekryje spoluúčast u půjčeného auta");
      }
      if (needs.has("liability")) {
        if (p.liability >= 3e6) pros.push(`Odpovědnost za škodu ${limit(p.liability)}`);
        else (score -= 8), cons.push(`Odpovědnost jen do ${limit(p.liability)}`);
      }
      if (needs.has("chronic")) {
        if (p.chronic) pros.push("Kryje akutní zhoršení chronické nemoci");
        else (score -= 28), cons.push("Nekryje chronická onemocnění");
      }

      // typ cestovatele
      if (p.familyProduct) {
        if (s.kids > 0) (score += 11), pros.unshift(p.kidsFactor === 0 ? "Děti pojištěné zdarma" : "Rodinná sleva");
        else score -= 12;
      }
      if (p.groupProduct) {
        if (persons >= p.groupDiscount.minPersons) (score += 10), pros.unshift(`Skupinová sleva ${p.groupDiscount.discount * 100} %`);
        else score -= 14;
      }
      if (p.annual) {
        const singleBest = Math.min(...rows.filter((r) => !r.p.annual).map((r) => r.q.price));
        if (s.frequency === "3+") (score += 9), pros.unshift("Vyplatí se při častém cestování");
        else if (s.frequency === "1") (score -= 26), cons.push("Na jednu cestu ročně se nevyplatí");
        if (s.days > p.maxTripDays) (score -= 30), cons.push(`Jedna cesta může trvat max. ${p.maxTripDays} dní`);
        if (s.frequency !== "1" && q.price < singleBest * tripsPerYear()) pros.push("Levnější než jednotlivá pojištění");
      }

      // cena a kvalita
      const norm = maxY === minY ? 0 : (q.yearly - minY) / (maxY - minY);
      score -= norm * wPrice;
      score += quality(p) * wQual;
      if (norm < 0.12) pros.push("Jedna z nejlevnějších variant");

      const match = Math.max(18, Math.min(99, Math.round(score)));
      return { p, q, match, pros: [...new Set(pros)].slice(0, 5), cons: cons.slice(0, 3) };
    });

    rows.sort((a, b) => b.match - a.match || a.q.yearly - b.q.yearly);
    return rows;
  }

  /* ---------- affiliate ---------- */
  function affiliateLink(p) {
    try {
      const url = new URL(p.affiliateUrl);
      const persons = state.adults + state.kids;
      Object.entries(CFG.affiliateParams || {}).forEach(([k, v]) => {
        url.searchParams.set(
          k,
          String(v)
            .replace("{product}", p.id)
            .replace("{region}", state.region)
            .replace("{persons}", persons)
            .replace("{days}", state.days)
        );
      });
      return url.toString();
    } catch (e) {
      return p.affiliateUrl;
    }
  }

  function trackClick(p, position) {
    const payload = { event: "affiliate_click", product_id: p.id, insurer: p.insurer, position, region: state.region, party: state.party };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") window.gtag("event", "affiliate_click", payload);
  }

  /* ---------- UI: wizard ---------- */
  const quiz = $("#kalkulacka");
  const form = $("#quiz-form");

  function syncUI() {
    $$(".opt[data-field]", quiz).forEach((btn) => {
      const f = btn.dataset.field;
      const v = btn.dataset.value;
      const on = Array.isArray(state[f]) ? state[f].includes(v) : String(state[f]) === v;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("#adults-val").textContent = state.adults;
    $("#kids-val").textContent = state.kids;
    $("#days-input").value = state.days;
    $("#party-counts").hidden = !state.party;
    $$(".chip[data-days]", quiz).forEach((c) => c.classList.toggle("is-selected", Number(c.dataset.days) === state.days));
  }

  function showStep(n) {
    step = n;
    $$(".quiz-step", quiz).forEach((el) => {
      const active = Number(el.dataset.step) === n;
      el.hidden = !active;
      el.classList.toggle("is-active", active);
    });
    const isResult = n > TOTAL_STEPS;
    $("#quiz-progress").hidden = isResult;
    $("#quiz-nav").hidden = isResult;
    if (!isResult) {
      $("#progress-bar").style.width = (n / TOTAL_STEPS) * 100 + "%";
      $("#progress-label").textContent = `Krok ${n} ze ${TOTAL_STEPS}`;
      $("#btn-back").disabled = n === 1;
      $("#btn-next").innerHTML = n === TOTAL_STEPS ? "Zobrazit doporučení <span aria-hidden='true'>→</span>" : "Pokračovat <span aria-hidden='true'>→</span>";
    }
    $("#quiz-error").textContent = "";
  }

  function validate(n) {
    if (n === 1) {
      if (!state.party) return "Vyberte, s kým cestujete.";
      if (!state.age) return "Vyberte věk nejstaršího cestujícího.";
      if (state.adults < 1) return "Alespoň jeden dospělý musí cestovat.";
    }
    if (n === 2) {
      if (!state.region) return "Vyberte, kam cestujete.";
      if (!(state.days >= 1 && state.days <= 365)) return "Zadejte délku cesty 1–365 dní.";
    }
    return "";
  }

  function scrollToQuiz() {
    const top = quiz.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function next() {
    const err = validate(step);
    if (err) {
      $("#quiz-error").textContent = err;
      return;
    }
    save();
    if (step < TOTAL_STEPS) {
      showStep(step + 1);
    } else {
      renderResults();
      showStep(TOTAL_STEPS + 1);
    }
    scrollToQuiz();
  }

  quiz.addEventListener("click", (e) => {
    const opt = e.target.closest(".opt[data-field]");
    if (opt) {
      const f = opt.dataset.field;
      const v = opt.dataset.value;
      if (Array.isArray(state[f])) {
        state[f] = state[f].includes(v) ? state[f].filter((x) => x !== v) : [...state[f], v];
      } else {
        state[f] = v;
        if (f === "party") Object.assign(state, PARTY_DEFAULTS[v]);
      }
      syncUI();
      save();
      return;
    }
    const counter = e.target.closest("[data-count]");
    if (counter) {
      const [field, delta] = counter.dataset.count.split(":");
      const min = field === "adults" ? 1 : 0;
      state[field] = Math.max(min, Math.min(20, state[field] + Number(delta)));
      syncUI();
      save();
      return;
    }
    const chip = e.target.closest(".chip[data-days]");
    if (chip) {
      state.days = Number(chip.dataset.days);
      syncUI();
      save();
    }
  });

  $("#days-input").addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    state.days = Number.isFinite(v) ? v : 0;
    $$(".chip[data-days]", quiz).forEach((c) => c.classList.toggle("is-selected", Number(c.dataset.days) === state.days));
    save();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    next();
  });
  $("#btn-back").addEventListener("click", () => step > 1 && showStep(step - 1));

  /* Karty "Pro koho" a CTA předvyplní dotazník */
  $$("[data-start-party]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const v = el.dataset.startParty;
      state.party = v;
      Object.assign(state, PARTY_DEFAULTS[v]);
      syncUI();
      showStep(1);
      scrollToQuiz();
    })
  );

  /* ---------- UI: results ---------- */
  function summaryText() {
    const s = state;
    const who =
      { solo: "Sólo cesta", couple: "Pár", family: "Rodina", group: "Skupina" }[s.party] +
      ` · ${s.adults} dosp.` +
      (s.kids ? ` + ${s.kids} ${s.kids === 1 ? "dítě" : s.kids < 5 ? "děti" : "dětí"}` : "");
    const acts = s.activities.length ? s.activities.map((a) => LABELS.activities[a]).join(", ") : "pohodová dovolená";
    return `${who} · ${LABELS.region[s.region]} · ${s.days} ${s.days === 1 ? "den" : s.days < 5 ? "dny" : "dní"} · ${acts}`;
  }

  function card(r, i) {
    const { p, q } = r;
    const best = i === 0;
    const priceLabel = p.annual ? "za rok pro všechny" : `za cestu pro ${q.persons === 1 ? "1 osobu" : q.persons < 5 ? q.persons + " osoby" : q.persons + " osob"}`;
    const perPerson = !p.annual && q.persons > 1 ? `<span class="price-sub">≈ ${kc(q.price / q.persons)} / osoba</span>` : "";
    return `
    <article class="result-card${best ? " is-best" : ""}" style="--accent:${esc(p.color)}">
      ${best ? '<div class="best-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7Z"/></svg>Nejlepší volba pro vás</div>' : ""}
      <div class="rc-head">
        <div>
          <p class="rc-insurer">${esc(p.insurer)}</p>
          <h3 class="rc-name">${esc(p.name)}</h3>
          <p class="rc-tagline">${esc(p.tagline)}</p>
        </div>
        <div class="match" style="--pct:${r.match}" aria-label="Shoda ${r.match} procent">
          <svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" class="match-bg"/><circle cx="18" cy="18" r="15.5" class="match-fg" pathLength="100"/></svg>
          <span><strong>${r.match}</strong>%</span>
        </div>
      </div>
      <ul class="rc-pros">${r.pros.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      ${r.cons.length ? `<ul class="rc-cons">${r.cons.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      <dl class="rc-table">
        <div><dt>Léčebné výlohy</dt><dd>${limit(p.medicalLimit)}</dd></div>
        <div><dt>Odpovědnost</dt><dd>${limit(p.liability)}</dd></div>
        <div><dt>Zavazadla</dt><dd>${limit(p.luggage)}</dd></div>
        <div><dt>Storno</dt><dd>${p.cancellation ? limit(p.cancellation.limit) : "nekryto"}</dd></div>
      </dl>
      <div class="rc-foot">
        <div class="price">
          <span class="price-from">orientačně</span>
          <strong>${kc(q.price)}</strong>
          <span class="price-sub">${priceLabel}</span>
          ${perPerson}
        </div>
        <a class="btn ${best ? "btn-primary" : "btn-outline"} rc-cta" href="${esc(affiliateLink(p))}" target="_blank" rel="sponsored noopener" data-product="${esc(p.id)}" data-pos="${i + 1}">
          Sjednat online <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>`;
  }

  let lastRows = [];
  function renderResults() {
    lastRows = evaluate();
    $("#result-summary").textContent = summaryText();
    $("#results-top").innerHTML = lastRows.slice(0, 3).map(card).join("");
    $("#results-more").innerHTML = lastRows.slice(3).map((r, i) => card(r, i + 3)).join("");
    $("#results-more").hidden = true;
    const moreBtn = $("#btn-more");
    moreBtn.hidden = lastRows.length <= 3;
    moreBtn.setAttribute("aria-expanded", "false");
    moreBtn.textContent = `Zobrazit další varianty (${lastRows.length - 3})`;
    $("#demo-notice").hidden = !CFG.DEMO_MODE;
  }

  $("#btn-more").addEventListener("click", (e) => {
    const more = $("#results-more");
    more.hidden = !more.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!more.hidden));
    e.currentTarget.textContent = more.hidden ? `Zobrazit další varianty (${lastRows.length - 3})` : "Skrýt další varianty";
  });

  $("#btn-restart").addEventListener("click", () => {
    showStep(1);
    scrollToQuiz();
  });

  quiz.addEventListener("click", (e) => {
    const a = e.target.closest("a.rc-cta");
    if (!a) return;
    const p = PRODUCTS.find((x) => x.id === a.dataset.product);
    if (p) trackClick(p, Number(a.dataset.pos));
  });

  /* ---------- misc UI ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navToggle = $("#nav-toggle");
  navToggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".main-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      header.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12 }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  $("#year").textContent = new Date().getFullYear();

  /* ---------- init ---------- */
  load();
  syncUI();
  showStep(1);
})();
