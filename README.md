# Dovča s jistotou

Propagační web s dotazníkem a kalkulačkou cestovního pojištění. Podle odpovědí návštěvníka doporučí pojistné balíčky a odkáže na ně přes affiliate odkazy.

Je to čistě statický web (HTML, CSS a JavaScript) bez build kroku a bez závislostí.

## Struktura

```
index.html              – stránka (hero, pro koho, jak to funguje, kalkulačka, tipy, FAQ)
assets/css/styles.css   – vzhled (barvy jsou v :root na začátku souboru)
assets/js/products.js   – ⭐ KONFIGURACE: pojišťovny, ceny, krytí, affiliate odkazy
assets/js/app.js        – logika dotazníku, výpočet ceny a hodnocení shody
assets/img/             – logo a ilustrace (SVG)
favicon.svg
```

## Lokální náhled

Otevřete `index.html` v prohlížeči, nebo spusťte:

```bash
python3 -m http.server 8000
```

## Jak napojit affiliate

1. Zaregistrujte se do affiliate programů pojišťoven nebo sítí (např. Dognet, eHub, CJ, přímé programy pojišťoven).
2. V `assets/js/products.js` nahraďte ukázkové produkty skutečnými: `insurer`, `name`, ceny, limity, sporty a hlavně `affiliateUrl`.
3. V `DSJ_CONFIG.affiliateParams` nastavte parametry podle vaší sítě. Například sub-ID se ve sítích jmenuje `subid`, `data1` nebo `a_aid`.
4. Přepněte `DEMO_MODE: false`, aby zmizel štítek s ukázkovými daty.

Proklik na pojišťovnu se posílá do `window.dataLayer` jako událost `affiliate_click`, takže ho po vložení Google Tag Manageru nebo GA4 hned uvidíte v analytice.

### Jak funguje doporučení

- **Cena:** cena za den podle destinace × počet dní × osoby, kde děti se počítají koeficientem `kidsFactor`. Pak se násobí věkovým koeficientem a příplatkem za sport a odečte se případná skupinová sleva. Celoroční produkty se porovnávají podle ceny za rok.
- **Shoda (%):** body se strhávají za nekryté sporty, chybějící storno, zavazadla, auto nebo chronická onemocnění a za nízké limity pro USA. Body se přidávají rodinným produktům pro rodiny s dětmi, skupinovým pro party a celoročním pro časté cestovatele. Nakonec se zohlední cena a kvalita krytí podle zvolené priority.

## Nasazení

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
- **Netlify nebo Vercel:** importujte repozitář, build command nechte prázdný a jako publish directory zadejte `/`.

## Před spuštěním do světa

- [ ] Skutečné produkty a affiliate odkazy v `products.js`, `DEMO_MODE: false`
- [ ] Stránka *Ochrana osobních údajů* a cookie lišta (pokud nasadíte analytiku)
- [ ] Ověřit, že doporučování pojištění nevyžaduje registraci u ČNB (zákon č. 170/2018 Sb. o distribuci pojištění), případně formulovat obsah jako srovnání a informace
- [ ] Vlastní doména a `og:image` jako PNG nebo JPG (sociální sítě neumí SVG)
