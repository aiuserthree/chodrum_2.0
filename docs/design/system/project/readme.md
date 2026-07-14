# 드럼악보 Store — Design System

A design system for a **mobile-first drum sheet-music download store** (드럼 악보 다운로드 사이트): search a song → preview the score → wishlist / cart → pay → download the PDF (7 days). It pairs a precise, near-monochrome "blueprint" visual language with Korean-first typography, and ships reusable React primitives plus two product UI kits (storefront + admin).

> **Working name / no logo.** No brand name or logo was supplied. "드럼악보" (Drum Sheet) is a **placeholder wordmark in plain type** used wherever a mark would go. Do not invent a logo — replace the wordmark when the real brand is provided.

---

## Sources

Everything here is derived from files the user provided (stored in `uploads/`). Assume the reader may not have them; they are listed for traceability.

- **`uploads/설계서 초안.md`** — the product spec (Korean): "드럼 악보 다운로드 사이트 설계서 초안 (모바일 최적화)". Defines the service, user types (일반/구글/네이버/카카오 회원 + 비회원), the front-office (FO) and back-office (BO) menu trees, and business rules (cart-only checkout, PG payment, 7-day PDF download, guest email lookup). This drives the **UI kits** and copy.
- **`uploads/DESIGN.md`, `tokens.json`, `variables.css`, `theme.css`** — an extracted visual token set (achromatic palette, Geist type scale, spacing/radius/shadow) originally captured from a v0.dev reference. Used purely as the **visual foundation**; the tokens are generic (monochrome, open-source Geist) and this system is the drum-sheet-store product, not a recreation of any other product.

No codebase or Figma file was provided — components are authored from the token set + spec, not reverse-engineered from source.

---

## Content fundamentals (voice & copy)

The product UI is **Korean-first**; English appears only for technical/mono annotations (order IDs, prices, labels like `PREVIEW`).

- **Tone:** friendly-polite, calm, concise. Uses the soft declarative **-어요/-요** register ("결제가 완료되었어요", "마음에 드는 악보를 담아보세요"), never stiff -습니다 nor casual 반말. Second person is implied, rarely spelled out (no aggressive "당신").
- **Casing:** Korean has no case; English UI terms are Title/UPPER only for mono tags (`NEW`, `PREVIEW`, `ORD-…`). Sentence-style for everything else.
- **Numerals & money:** always `₩` + thousands separators in **Geist Mono, tabular** (`₩12,000`), so columns align. Dates as `2026.07.13`, download countdowns as `D-5` / `D-2` / `기간 만료`.
- **Buttons:** verb-first, short — `장바구니 담기`, `결제하기`, `다운로드`, `찜하기`. Primary CTA states the amount when paying (`₩9,000 결제하기`).
- **Microcopy:** explains policy inline, gently — "결제일로부터 7일간 다운로드할 수 있어요.", "비회원은 이 이메일로만 다운로드를 조회할 수 있어요."
- **Emoji:** none. Iconography carries all symbolic meaning.
- **Vibe:** trustworthy digital-goods shop — precise, uncluttered, a little technical (mono numerals evoke a "spec sheet").

---

## Visual foundations

**Overall feel** — a functional schematic on a stark white drafting table. Nearly monochrome; **colour comes from content, not chrome.** Type is the primary architectural element.

- **Colour.** Seven achromatic steps: Paper White `#ffffff`, Canvas `#fafafa` (page bg), Line `#eaeaea` (borders), Icon `#7d7d7d`, Subtext `#666666`, Ink `#171717` (text + primary fills), Onyx `#000000`. **No saturated colour in chrome.** A restrained **functional-status** set (success/warning/danger/info) is an *intentional addition* for an e-commerce product — used only in small badges/dots/inline text (payment state, download expiry), never as surfaces. Social-login brand colours are the one sanctioned chrome exception.
- **Type.** `Geist` (Latin + numerals) + `Pretendard` (Hangul), weights 400/500/600 — **never 700+**. Hierarchy comes from size and *progressively tighter negative tracking* (−0.48px @24 → −2.88px @48), the brand signature. `Geist Mono` for prices, counts and annotations (tabular, slashed zero via `font-feature-settings: "zero"`). Scale: caption 10 · body-sm 14 · body 16 · subheading 18 · heading-sm 20 · heading 24 · heading-lg 32 · display 48.
- **Spacing & layout.** Compact, 8-based rhythm (4→80). Mobile storefront ≈ 390–430px with 16px gutters; desktop admin on a 232px sidebar + fluid content. Generous whitespace between sections; clarity over density.
- **Backgrounds.** Flat Canvas `#fafafa`. **No gradients, no background images, no decorative texture.** The only "imagery" is user content (score previews) shown as raw content in rounded containers; here they are staff-line placeholders (no real artwork supplied).
- **Corners.** chips 6 · buttons 8 · cards & inputs 12 · pills/circles 9999. No other radii.
- **Borders vs shadows.** A single 1px `#eaeaea` line does all dividing/outlining. **Shadows are reserved for cards, popovers and modals — never on buttons or inputs.** Card default = hairline ring + faint 2px lift (`--shadow-subtle`); modal = `--shadow-xl`.
- **Cards.** White surface, 12px radius, `--shadow-subtle`. Interactive cards add a −1px translate + slightly softer ambient shadow on hover.
- **Hover / press.** Hover: primary → Onyx; secondary → border darkens to `--border-strong`; ghost → subtle `rgba(0,0,0,.04)` wash + Ink text; cards → lift. Press: gentle `scale(0.985)` on buttons, `0.94` on icon buttons. No bounce.
- **Motion.** Quick, functional `ease` transitions (80–140ms) on colour/border/transform; a 400ms ease on the dashboard bars. No infinite/decorative loops.
- **Transparency & blur.** Sticky top bars use `rgba(255,255,255,0.9)` + `backdrop-filter: blur`. Otherwise opaque.
- **Focus.** Inputs/selects show a soft achromatic outer glow (`box-shadow: 0 0 0 3px --focus-ring`) — no coloured focus rings.

---

## Iconography

- **Line icons — Lucide**, loaded from CDN (`cdn.jsdelivr.net/npm/lucide-static`). The `Icon` component renders each glyph as a **CSS mask tinted with `currentColor`**, so icons inherit text colour and size — no runtime script, works inside the bundle. Default inactive tint is `--color-icon` (#7d7d7d). Common names: `search`, `heart`, `shopping-cart`, `download`, `star`, `music`, `user`, `filter`, `chevron-*`, `x`, `check`, `plus`, `minus`. *(Substitution flagged: the source defined no icon set; Lucide's thin-stroke style matches the precise aesthetic.)*
- **Brand marks — Simple Icons** for Kakao (`kakaotalk`) and Naver (`naver`) on `SocialButton`, via CDN mask in each brand's mandated colour. **Google's official multi-colour mark is not bundled** (trademark) — pass it to `SocialButton` via `iconUrl` for production.
- **No emoji, no Unicode-glyph icons, no hand-drawn SVG logos.**

---

## Foundations, in the Design System tab

Specimen cards live in `guidelines/` and render live against `styles.css`:
`Colors` (palette · text-on-surface · functional status · borders) · `Type` (display/headings · body · mono · weights) · `Spacing` (scale · radius) · `Elevation` (shadows) · `Brand` (wordmark · principles).

---

## Components (`components/`)

Reusable React primitives. Import in an `@dsCard` HTML via `const { X } = window.DrumSheetStoreDesignSystem_3a2462` after loading `_ds_bundle.js`. Each has a `.d.ts` contract and a `.prompt.md` usage note.

**actions/** — `Button` (primary / secondary / ghost · sm/md/lg · icons) · `IconButton` (square or round icon action).
**forms/** — `Input` (label/hint/error, focus glow) · `Select` (native, styled) · `Checkbox` (+ indeterminate) · `QuantityStepper` (−/value/+) · `SocialButton` (Kakao / Naver / Google / email).
**display/** — `Card` (surface + elevation) · `Badge` (neutral/solid/outline + status tones) · `Chip` (pill filter/toggle) · `Divider` (1px rule, optional label) · `Icon` (Lucide via mask).

*Intentional additions beyond the source token set:* `Icon` (glyph wrapper — the source defined no icon set), `SocialButton` and `QuantityStepper` (required by the spec's auth + purchase flows), and the functional-status colour tokens.

## UI kits (`ui_kits/`)

- **`storefront/`** — mobile FO, interactive: Home · SheetList · SheetDetail · Cart · Checkout · Complete · Wishlist · MyPage · Login · GuestLookup. See `ui_kits/storefront/README.md`.
- **`admin/`** — desktop BO: Dashboard · 악보 관리 · 주문/결제 · 회원 관리 · settings placeholders. See `ui_kits/admin/README.md`.

---

## Root index / manifest

- `styles.css` — **the single entry consumers link.** `@import`s the fonts (Geist + Pretendard via CDN) and every token file.
- `tokens/` — `colors.css` · `typography.css` · `spacing.css` · `radius.css` · `elevation.css` · `base.css`.
- `guidelines/` — foundation specimen cards (see above).
- `components/` — `actions/` · `forms/` · `display/`.
- `ui_kits/` — `storefront/` · `admin/`.
- `SKILL.md` — Agent-Skills-compatible entry so this system can be used from Claude Code.
- `uploads/` — original provided sources.
- `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — **generated**; do not edit.

---

## Caveats & flags

- **Fonts load from CDN.** Geist / Geist Mono (Google Fonts) + Pretendard (jsDelivr). Geist is Latin-only, so **Pretendard was added for Hangul** — a substitution decision, not from the source. For production, self-host (Fontsource / google-webfonts-helper) and add local `@font-face` rules.
- **No logo / brand name** provided → placeholder wordmark; documented above.
- **Functional-status colours** and the **icon system** are additions, flagged above.
- **No score artwork** provided → staff-line placeholders. Real thumbnails should drop into the same rounded containers.
- BO settings screens (배너/약관/PG/이메일) are placeholders pending source material — not invented.
