**Input** — single-line text entry (search, email, order name). Matches the 12px-radius / 1px-border language; focus adds a soft achromatic glow.

```jsx
<Input placeholder="곡명, 아티스트 검색" iconLeft="search" />
<Input label="이메일" type="email" hint="다운로드 조회에 사용됩니다" />
<Input label="비밀번호" type="password" error="비밀번호를 확인해 주세요" />
```

- `iconLeft` puts a Lucide glyph inside the field (Icon tint).
- `error` overrides `hint` and colours the border/message with `--status-danger`.
- Sizes `sm` 36 · `md` 44 · `lg` 50 px.
