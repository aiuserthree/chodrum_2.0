---
name: drumsheet-store-design
description: Use this skill to generate well-branded interfaces and assets for the 드럼악보 (Drum Sheet Store) — a mobile-first Korean drum sheet-music download shop — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, and a UI kit of components for prototyping the storefront and admin.
user-invocable: true
---

Read the `readme.md` file within this skill first — it is the full design guide and manifest — then explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few clarifying questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are
- `styles.css` — the single global stylesheet. Link it and you get the fonts (Geist + Pretendard) and every design token. Everything is a CSS custom property (e.g. `--color-ink`, `--text-heading-lg`, `--radius-cards`, `--shadow-subtle`).
- `tokens/` — colours, typography, spacing, radius, elevation, base element styles.
- `guidelines/` — foundation specimen cards (colours, type, spacing, elevation, brand).
- `components/` — React primitives (`actions/`, `forms/`, `display/`). Each has a `.jsx`, a `.d.ts` contract, and a `.prompt.md` usage note. Read the `.prompt.md` files to learn each component fast.
- `ui_kits/storefront/` and `ui_kits/admin/` — full interactive product recreations to copy patterns from.

## Non-negotiable brand rules (see readme.md for detail)
1. **Achromatic chrome.** White / grey / Ink only. Colour comes from content and small status badges — never page or component chrome. (Social-login brand colours are the one exception.)
2. **Type is the hierarchy.** Geist (Latin/numbers) + Pretendard (Hangul), weights 400/500/600 — never 700+. Tighten letter-spacing as size grows. Prices/counts in Geist Mono, tabular, slashed zero.
3. **Borders, not shadows,** on interactive elements. Shadows are for cards/modals only. Radii: chips 6 · buttons 8 · cards/inputs 12 · pills 9999.
4. **Korean-first, polite -어요 voice.** No emoji. Verb-first buttons.
5. **No invented logo.** Use the "드럼악보" plain-type wordmark until a real mark exists.

## Using the components
In an HTML file: link `styles.css`, load React + ReactDOM + Babel (pinned), then `_ds_bundle.js`, then read components off the global namespace:
```js
const { Button, Card, Badge, Icon /* … */ } = window.DrumSheetStoreDesignSystem_3a2462;
```
For static/throwaway artifacts you may also just write plain HTML/CSS using the tokens from `styles.css` directly.
