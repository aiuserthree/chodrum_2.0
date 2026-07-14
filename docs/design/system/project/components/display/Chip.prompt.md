**Chip** — a tappable pill for category / genre / difficulty filters and search suggestions. Toggles between bordered (off) and solid Ink (on).

```jsx
<Chip selected>전체</Chip>
<Chip icon="filter">필터</Chip>
<Chip count={128}>발라드</Chip>
```

- Drive `selected` from your filter state and toggle it in `onClick`.
- `count` renders a muted trailing number; `icon` prepends a Lucide glyph.
