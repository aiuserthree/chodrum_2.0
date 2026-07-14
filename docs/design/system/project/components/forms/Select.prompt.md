**Select** — native dropdown for choosing one option (정렬, 장르, 난이도). Styled like Input with a chevron affordance.

```jsx
<Select placeholder="정렬" options={['인기순','최신순','가격순','이름순']} />
<Select label="난이도" options={[{value:'beginner',label:'입문'},{value:'advanced',label:'고급'}]} />
```

- `options` accepts plain strings or `{value,label}` objects.
- Add `placeholder` for an empty leading option.
