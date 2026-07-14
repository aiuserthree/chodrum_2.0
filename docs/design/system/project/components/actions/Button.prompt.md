**Button** — the action control across the store. Use `primary` for the single main action on a view (결제하기, 장바구니 담기), `secondary` for supporting actions, `ghost` for tertiary/nav-like actions.

```jsx
<Button variant="primary" size="lg" fullWidth>결제하기</Button>
<Button variant="secondary" iconLeft="shopping-cart">장바구니</Button>
<Button variant="ghost" iconRight="chevron-right">더보기</Button>
```

- `variant`: `primary` (solid Ink) · `secondary` (white + 1px Line border) · `ghost` (text only, Subtext → Ink on hover).
- `size`: `sm` 13px · `md` 14px (default) · `lg` 16px.
- `iconLeft` / `iconRight` take Lucide names. `fullWidth` stretches to the container (use for mobile sticky CTAs).
- Never carries a shadow. Disabled state is a flat grey fill.
