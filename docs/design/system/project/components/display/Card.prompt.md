**Card** — wraps any block of content on a white surface with the brand's hairline shadow and 12px radius. Use `interactive` for grid items that navigate on click.

```jsx
<Card>{/* order summary */}</Card>
<Card interactive onClick={goToSheet} padding={0}>{/* sheet thumbnail + meta */}</Card>
<Card elevation="outline">{/* flat, ring-only panel */}</Card>
```

- `elevation`: `card` (default lift) · `outline` (1px ring) · `none`.
- Set `padding={0}` when the card holds a full-bleed thumbnail, then pad inner content yourself.
