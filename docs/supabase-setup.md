# CHODRUM — Supabase FO ↔ BO 연결 가이드

정적 HTML(FO/BO)이 같은 Supabase 프로젝트를 읽고 쓰도록 연결했습니다.
키가 없으면 기존 `data.js` 로컬 데모로 동작합니다.

## 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. **SQL Editor**에서 순서대로 실행:
   - `supabase/migrations/001_init.sql`
   - `supabase/seed.sql`
   - `supabase/migrations/002_member_consent.sql` (회원 약관 동의 컬럼)
3. **Project Settings → API**에서 복사:
   - Project URL
   - `anon` `public` key

## 2. 키 설정 (필수)

브라우저 정적 서버는 `.env`를 읽지 않으므로 **`html/shared/config.js`**에 직접 넣습니다.

```js
window.CHODRUM_CONFIG = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi...',
  NAVER_CLIENT_ID: '',           // 네이버 Developers Client ID (공개)
  NAVER_OAUTH_MODE: 'bridge',    // 'bridge' | 'custom'
};
```

참고용 템플릿: 루트 `.env.example`

**주의:** `service_role` 키는 HTML에 넣지 마세요.

## 3. 연결된 데이터 흐름

| 테이블 | BO (쓰기/관리) | FO (읽기/생성) |
|--------|----------------|----------------|
| `sheets` | 악보 목록·등록·수정·삭제·상태 | 홈 / 목록 / 상세 (판매중만) |
| `featured_sheets` | 추천 관리 저장 | 홈 「추천 악보」 |
| `home_promo` | (시드) 홈 프로모 | 홈 상단 추천 배너 |
| `banners` | 배너 관리 CRUD | (BO 저장; FO 홈은 home_promo 사용) |
| `orders` + `order_items` | 주문 목록·환불 | 결제 완료 시 생성 |
| `downloads` | 다운로드 관리 조회 | 결제 시 권한 생성 / 비회원 조회 |
| `members` | 회원 목록 조회 | 이메일 가입 · **소셜 OAuth + 약관 동의 후** upsert (`terms_agreed_at` 등) |
| `site_settings` | 장르·난이도 | FO 필터 |

## 4. 이메일 인증 가입 (OTP)

회원가입(`FO-08-signup.html`)은 **6자리 이메일 OTP** → 비밀번호/프로필 → 약관 순입니다.

코드: `signInWithOtp` → `verifyOtp` (`signup` / `email` / `magiclink`) → `updateUser({ password, data })` → `members` upsert  
(`signUp` 을 쓰지 않습니다. `signUp` 은 Confirm signup 링크 메일만 보내는 경로입니다.)

### 4-1. Dashboard 필수 설정

**Authentication → Providers → Email**  
(직접 링크: `https://supabase.com/dashboard/project/_/auth/providers?provider=Email`)

- Email provider **Enable**
- Confirm email: 켜져 있어도 OK (OTP는 `verifyOtp`로 확인)
- **Email OTP length** (또는 OTP length) → **6** 으로 설정  
  - 메일 `{{ .Token }}` 자릿수는 앱이 아니라 Supabase Auth가 정합니다. 프로젝트에 따라 기본값이 **8**인 경우가 있습니다.
  - 앱·메일 템플릿·카피는 모두 **6자리** 기준이므로 Dashboard를 6에 맞추세요. (UI/`auth.js`는 `maxlength`·`/^\d{6}$/` 검증)
  - 같은 화면의 **Email OTP Expiration**도 필요하면 함께 확인하세요.

**Authentication → Email Templates — 중요**

호스팅 Supabase에서 `signInWithOtp` + `shouldCreateUser: true` 로 **아직 이메일 미확인인 신규**에게 메일을 보내면,
커스텀한 **Magic Link**가 아니라 **Confirm sign up** 템플릿이 나갑니다.
(기본 제목: `Confirm your email address`, 본문: ConfirmationURL 링크만)

그래서 **동일 HTML(`email/otp.html`)을 두 곳에 붙여넣어야** 합니다.

| 템플릿 이름 (Dashboard) | 언제 쓰이나 |
|-------------------------|-------------|
| **Confirm sign up** | 신규·미확인 계정 첫 OTP (가입 테스트에서 대부분 여기) |
| **Magic Link** | 이미 확인된 계정에 다시 OTP 보낼 때 |
| **Reset password** | 비밀번호 찾기 (`resetPasswordForEmail`) |

각 템플릿 Subject 예: `[CHODRUM] 인증코드를 확인해주세요`  
본문에 **6자리 코드**가 보이도록 `{{ .Token }}` 을 넣으세요. 예:

```html
<h2>CHODRUM 인증코드</h2>
<p>아래 6자리 코드를 입력해주세요.</p>
<p style="font-size:24px;letter-spacing:4px;"><strong>{{ .Token }}</strong></p>
```

기본 Confirm sign up 에는 `{{ .ConfirmationURL }}`만 있고 `{{ .Token }}`이 없습니다.  
매직 링크만 있으면 UI의 코드 입력이 동작하지 않습니다.

**비밀번호 찾기**는 **Reset password** 템플릿에 `{{ .Token }}` (`email/reset-password.html`).

### 4-2. Redirect / Site URL

**Authentication → URL Configuration**

- **Site URL:** `http://127.0.0.1:8765`
- **Redirect URLs:**
  - `http://127.0.0.1:8765/fo/FO-08-auth-callback.html`
  - `http://127.0.0.1:8765/fo/**`

운영 도메인이 있으면 동일 경로를 추가하세요.

### 4-3. SMTP (권장)

기본 제공 메일은 **시간당 발송 제한·스팸함 분류**가 있습니다.  
운영 전에는 **Project Settings → Authentication → SMTP** 에 자체 SMTP를 연결하세요.

### 4-4. 비밀번호 정책 (앱)

FO에서 강제: **영문 + 숫자 + 특수문자, 8자 이상**  
(`ChodrumAuth.validatePassword` — 가입 / 비밀번호 찾기 / 마이페이지 변경)

Supabase Dashboard **Auth → Password** 최소 길이도 8 이상으로 맞추는 것을 권장합니다.

## 5. 소셜 로그인 (Google / Kakao / Naver)

OAuth만으로는 앱 로그인되지 않습니다. **약관 동의(`FO-08-oauth-terms.html`)** 후에 `members`에 프로필·동의 시각이 저장되고 마이페이지로 이동합니다.

| Provider | FO UI | 구현 |
|----------|-------|------|
| Google | 활성 | Supabase 기본 Provider |
| Kakao | 활성 | Supabase 기본 Provider |
| Naver | Client ID + Edge Function 설정 시 활성 | 기본 Provider 없음 → **bridge** 또는 **custom** |

### 5-1. Redirect URL (필수)

코드 콜백: `html/shared/auth.js` → `/fo/FO-08-auth-callback.html`

Supabase Redirect URLs에 위 URL을 등록하세요 (§4-2).

### 5-2. Google

1. [Google Cloud Console](https://console.cloud.google.com/) → OAuth 클라이언트 (웹)
2. 승인된 리디렉션 URI: `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
3. **Supabase → Authentication → Providers → Google** → Enable → Client ID/Secret

### 5-3. Kakao (실제 가입)

1. [Kakao Developers](https://developers.kakao.com/) 앱 등록
2. **카카오 로그인** 활성화, Redirect URI:
   - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
3. REST API 키 / Client Secret 확인
4. **Supabase → Authentication → Providers → Kakao** → Enable → 키 입력 → Save
5. FO에서 카카오 버튼 → Supabase `signInWithOAuth({ provider: 'kakao' })`

미설정 시 버튼 클릭 시 Provider 오류가 납니다.

### 5-4. Naver (실제 가입) — 권장: bridge 모드

Supabase에는 네이버 기본 Provider가 없습니다.  
이 프로젝트는 **Edge Function `naver-auth`** 로 코드를 교환하고 Supabase 세션을 만듭니다.

#### A. 네이버 Developers

1. [Naver Developers](https://developers.naver.com/) → 애플리케이션 등록
2. 로그인 오픈 API 사용, **이메일**을 **필수 동의**로
3. Callback URL (서비스 URL과 일치):
   - 로컬: `http://127.0.0.1:8765/fo/FO-08-auth-callback.html`
   - 운영: `https://your-domain/fo/FO-08-auth-callback.html`
4. **Client ID** / **Client Secret** 복사

#### B. config.js

```js
NAVER_CLIENT_ID: '네이버_Client_ID',
NAVER_OAUTH_MODE: 'bridge',
```

#### C. Edge Function 배포

```bash
# CLI 로그인·프로젝트 링크 후
supabase secrets set NAVER_CLIENT_ID=... NAVER_CLIENT_SECRET=...
supabase functions deploy naver-auth --no-verify-jwt
```

소스: `supabase/functions/naver-auth/index.ts`

흐름: FO → 네이버 동의 → 콜백 `?code=` → Function이 토큰·프로필 처리 → `hashed_token` → 브라우저 `verifyOtp` → (신규면) 약관 → `members` upsert

#### D. (선택) Custom Provider 모드

Supabase **Custom OAuth Provider**를 쓸 수 있으면:

```bash
supabase functions deploy naver-userinfo --no-verify-jwt
```

Dashboard에서 Custom Provider 수동 설정 예:

| 항목 | 값 |
|------|-----|
| Identifier | `naver` |
| Authorization URL | `https://nid.naver.com/oauth2.0/authorize` |
| Token URL | `https://nid.naver.com/oauth2.0/token` |
| Userinfo URL | `https://<REF>.supabase.co/functions/v1/naver-userinfo` |
| Scopes | `profile` (**openid 넣지 말 것**) |
| Client ID/Secret | 네이버 앱 값 |

```js
NAVER_OAUTH_MODE: 'custom',
```

FO는 `signInWithOAuth({ provider: 'custom:naver' })` 를 호출합니다.

### 5-5. 테스트 방법

```bash
cd html && python3 -m http.server 8765 --bind 127.0.0.1
```

1. http://127.0.0.1:8765/fo/FO-08-signup.html — 이메일 OTP 가입
2. http://127.0.0.1:8765/fo/FO-08-login.html — Google / 카카오 / 네이버
3. 신규 소셜 → `FO-08-oauth-terms.html` → 마이페이지
4. 콘솔: `ChodrumAuth.live() === true`

## 6. 확인 방법 (데이터 FO↔BO)

1. http://127.0.0.1:8765/bo/BO-02-sheet-register.html — 악보 등록
2. http://127.0.0.1:8765/fo/FO-01-home.html — 같은 악보 노출
3. FO 결제 → BO 주문 반영
4. `ChodrumAPI.mode === 'live'` 이면 Supabase 연결됨

## 7. 보안 (데모 한계)

현재 RLS는 **프로토타입용 anon 전체 허용**입니다.
운영 전에는 BO 관리자 Auth + 역할 기반 정책으로 교체하세요.
OAuth 세션은 브라우저 localStorage에 저장됩니다 (`persistSession: true`).
