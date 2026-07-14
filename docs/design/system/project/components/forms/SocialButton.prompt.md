**SocialButton** — social / email account entry on the login & signup screens. Each provider renders in its required brand colour (Kakao yellow, Naver green, Google white, email Ink).

```jsx
<SocialButton provider="kakao" />
<SocialButton provider="naver" />
<SocialButton provider="google" iconUrl="/assets/google-g.svg" />
<SocialButton provider="email" />
```

- Kakao & Naver glyphs load from the Simple Icons CDN. **Supply Google's official mark via `iconUrl`** — it is not bundled (trademark).
- Full width by default; stack them with an 8px gap.
- This is the only component that introduces saturated colour; do not reuse these colours elsewhere.
