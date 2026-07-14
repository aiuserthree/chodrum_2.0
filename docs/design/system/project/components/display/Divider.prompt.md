**Divider** — the single hairline separator used for headers, list rows and section breaks. Horizontal by default; supports a centred label and a vertical mode for inline meta.

```jsx
<Divider />
<Divider label="또는" />
<span>난이도</span><Divider orientation="vertical" /><span>페이지 12</span>
```

- Always `--border-default` (#eaeaea). Don't introduce other divider colours.
- `spacing` controls the margin along the rule's axis.
