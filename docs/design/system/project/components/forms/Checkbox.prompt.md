**Checkbox** — selection and agreement control. Solid Ink when checked. Use `indeterminate` for a "select all" master row.

```jsx
<Checkbox checked={sel} onChange={setSel} label="전체 선택" />
<Checkbox checked={agree} onChange={setAgree} label="구매조건 및 결제에 동의합니다" />
<Checkbox indeterminate onChange={selectAll} />
```

- Controlled: pass `checked` + `onChange(next)`.
- `label` is optional — omit for a bare box (e.g. table header).
