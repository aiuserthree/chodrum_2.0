**Badge** — a small label. Use `solid` for promotional tags (인기 · NEW), `outline` for difficulty/genre (입문 · 락), and the status tones for order/download state.

```jsx
<Badge variant="solid">인기</Badge>
<Badge variant="outline">입문</Badge>
<Badge variant="success" icon="check">결제 완료</Badge>
<Badge variant="warning">다운로드 D-2</Badge>
<Badge variant="danger">기간 만료</Badge>
```

- Non-interactive — for a clickable pill use `Chip` instead.
- Keep status colours to badges; never fill large chrome with them.
