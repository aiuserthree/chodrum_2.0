# Admin UI kit — 드럼악보 (desktop, BO)

Desktop back-office recreation of the admin structure in the product spec (`관리자 화면 (BO)`). Composes the design-system primitives on the achromatic shell.

## Run
Open `index.html`. Previewed in the Design System tab under group **Admin**.

## Views (sidebar navigation)
- **대시보드** — 4 KPI stat cards, a 7-day revenue bar chart, and a recent-orders table.
- **악보 관리** — searchable / genre-filterable sheet table with price, sales, status `Badge` and edit / hide actions; 악보 등록 CTA.
- **주문 / 결제** — status-filter `Chip`s (전체 · 결제완료 · 대기 · 환불) over an orders table (member vs guest, method, amount, status).
- **회원 관리** — member table with join-type badges (이메일 / 구글 / 네이버 / 카카오), order counts, status.
- **매출/통계 · 배너/추천 · 약관 · PG · 이메일** — nav destinations from the spec; shown as labelled placeholders (detailed UI pending source material) rather than invented screens.

## Files
`index.html` is self-contained. `window.AdminData` plus the sidebar / topbar shell, the `StatCard` / `Bars` / `Table` helpers and the five views are inlined as script blocks that compose the design-system bundle (kept inline so the compiler bundles only the DS components, not the kit app code).

## Notes
- Tables, chart and chrome are strictly achromatic; the only colour is status `Badge`s (success/warning/danger), used sparingly.
- 드럼악보 is a placeholder wordmark — no logo supplied.
