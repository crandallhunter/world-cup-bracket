# Country flags used in Meebits Futbol

All flags currently rendered by the app come from **flagcdn.com** (free SVG CDN, no API key).
URL pattern: `https://flagcdn.com/<code>.svg` — replace `<code>` with the codes below.

48 unique flags, one per World Cup 2026 participating team. Codes are
ISO 3166-1 alpha-2 (lowercase), with two non-ISO codes for UK constituent
countries that flagcdn supports specifically: `gb-eng` (England) and
`gb-sct` (Scotland).

---

## Bulk download

To grab every SVG at once on macOS / Linux:

```bash
mkdir -p flags && cd flags
codes=(mx kr za cz ca ch qa ba br ma gb-sct ht us py au tr de ec ci cw nl jp tn se be ir eg nz es uy sa cv fr sn no iq ar at dz jo pt co uz cd gb-eng hr pa gh)
for c in "${codes[@]}"; do curl -sO "https://flagcdn.com/$c.svg"; done
```

That writes 48 SVGs into a `flags/` folder, named `mx.svg`, `kr.svg`, …, `gh.svg`.

flagcdn also offers PNGs at fixed widths if you'd rather raster — same path
with `/<width>/` prefix, e.g. `https://flagcdn.com/256x192/mx.png` for
Mexico at 256×192. Available widths: 16, 20, 24, 28, 32, 36, 40, 48, 56,
64, 72, 80, 84, 96, 108, 112, 120, 128, 144, 160, 192, 224, 240, 256, 320,
640, 1280, 2560.

---

## Full list, grouped by World Cup group

### Group A
- `mx` — Mexico
- `kr` — South Korea
- `za` — South Africa
- `cz` — Czechia

### Group B
- `ca` — Canada
- `ch` — Switzerland
- `qa` — Qatar
- `ba` — Bosnia & Herzegovina

### Group C
- `br` — Brazil
- `ma` — Morocco
- `gb-sct` — Scotland
- `ht` — Haiti

### Group D
- `us` — USA
- `py` — Paraguay
- `au` — Australia
- `tr` — Türkiye

### Group E
- `de` — Germany
- `ec` — Ecuador
- `ci` — Côte d'Ivoire
- `cw` — Curaçao

### Group F
- `nl` — Netherlands
- `jp` — Japan
- `tn` — Tunisia
- `se` — Sweden

### Group G
- `be` — Belgium
- `ir` — Iran
- `eg` — Egypt
- `nz` — New Zealand

### Group H
- `es` — Spain
- `uy` — Uruguay
- `sa` — Saudi Arabia
- `cv` — Cape Verde

### Group I
- `fr` — France
- `sn` — Senegal
- `no` — Norway
- `iq` — Iraq

### Group J
- `ar` — Argentina
- `at` — Austria
- `dz` — Algeria
- `jo` — Jordan

### Group K
- `pt` — Portugal
- `co` — Colombia
- `uz` — Uzbekistan
- `cd` — DR Congo

### Group L
- `gb-eng` — England
- `hr` — Croatia
- `pa` — Panama
- `gh` — Ghana

---

## Naming convention if your designer makes their own

If they're producing custom illustrated flags, please keep filenames
matching the codes above (e.g. `gb-eng.svg`, not `england.svg`). The
`<Flag>` component in `src/components/ui/Flag.tsx` builds the URL from
those exact codes — anything else will require a code change.
