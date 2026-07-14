**IconButton** — a compact, square action with no text label. Use for favouriting (heart), closing (x), opening menus, and quantity steppers. Always pass `label` for accessibility.

```jsx
<IconButton name="heart" label="찜하기" />
<IconButton name="x" variant="secondary" label="닫기" />
<IconButton name="minus" variant="secondary" size="sm" label="수량 감소" />
```

- `variant`: `ghost` (default, Icon tint → Ink on hover) · `secondary` (bordered) · `primary` (solid Ink).
- `round` makes it a pill/circle — used for floating favourite buttons over thumbnails.
- Sizes `sm` 32 · `md` 38 · `lg` 46 px, matching Button heights.
