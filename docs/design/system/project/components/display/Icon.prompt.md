**Icon** — a thin-stroke Lucide glyph that inherits the current text colour and scales to any size. Use it inside buttons, list rows, nav and status chips instead of hand-rolled SVG or emoji.

```jsx
<Icon name="shopping-cart" size={20} />
<span style={{ color: 'var(--color-icon)' }}><Icon name="heart" /></span>
```

- `name` takes any Lucide id (kebab-case): `search`, `download`, `star`, `chevron-right`, `heart`, `music`, `user`, `filter`, `x`, `check`, `plus`, `minus`.
- Colour follows `currentColor` — set it on the icon or a parent. Default tertiary tint is `var(--color-icon)`.
- Loaded from the Lucide CDN via CSS mask; no script needed.
