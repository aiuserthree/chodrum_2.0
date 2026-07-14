**QuantityStepper** — adjust the number of copies on the sheet detail page and in the cart. Clamps to `min`/`max`.

```jsx
<QuantityStepper value={qty} min={1} max={10} onChange={setQty} />
<QuantityStepper value={qty} size="sm" onChange={setQty} />
```

- Built from two `IconButton`s around a tabular-numeral value.
- Buttons auto-disable at the min/max bounds.
