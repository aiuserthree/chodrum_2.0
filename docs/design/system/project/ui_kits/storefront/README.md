# Storefront UI kit — 드럼악보 (mobile, FO)

An interactive, mobile-first recreation of the customer-facing storefront described in the product spec (`드럼 악보 다운로드 사이트`). It composes the design-system primitives — it does **not** re-implement them.

## Run
Open `index.html`. The Design System tab also previews it (group **Storefront**). The bundle (`_ds_bundle.js`) must be compiled (it is, automatically) for the primitives to load.

## Flow (all fake, client-side)
`홈` → tap a sheet → `악보 상세` → **장바구니 담기** → `장바구니` → **결제하기** → `주문/결제` (member auto-fill vs guest email) → **결제 완료** → download. Bottom tabs switch `홈 · 악보 · 찜 · 마이`; `마이페이지` shows the 7-day download states (active / D-2 warning / expired) and links to `비회원 주문 조회` and `로그인 / 회원가입`.

## Screens
- **Home** — wordmark header, search entry, category chips, 인기/신규 rails.
- **SheetList** — sticky category filter + sort `Select`, 2-col grid.
- **SheetDetail** — watermarked preview, meta table, `QuantityStepper`, sticky 찜 + 장바구니 bar, related rail. (No direct buy — cart-only checkout, per spec.)
- **Cart** — select-all, per-row `Checkbox` + stepper + remove, totals, sticky pay bar, empty state.
- **Checkout** — 주문자 정보 (member vs guest email), order summary, PG method radios, required-terms `Checkbox`es.
- **Complete** — order number, member vs guest download guidance, 7-day note.
- **Wishlist / MyPage / Login / GuestLookup** — favourites, purchases + download states, social + email auth, guest email verification.

## Files
`index.html` is fully self-contained. Sample data, the shared chrome (`MobileFrame`, `TopBar`, `TabBar`, `SheetCard`, `SheetRow`, `StaffThumb`, `Money`, `SectionHeader`, `Stars`), the ten screens, and the navigation / cart / faves / user state are inlined as `<script type="text/babel">` blocks that compose the design-system bundle. They are kept **inline on purpose** — the compiler bundles every `.js`/`.jsx` in the project, so external kit files would be pulled into `_ds_bundle.js` (with their top-level `render()` side-effects) and break every page that loads the bundle.

## Notes
- 드럼악보 is a **placeholder wordmark** in plain type — no logo was supplied.
- Social auth uses each provider's mandated brand colour (`SocialButton`); supply Google's official mark via `iconUrl` for production.
