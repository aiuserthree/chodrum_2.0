# CHODRUM — Supabase FO ↔ BO 연결 가이드

정적 HTML(FO/BO)이 같은 Supabase 프로젝트를 읽고 쓰도록 연결했습니다.
키가 없으면 기존 `data.js` 로컬 데모로 동작합니다.

## 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. **SQL Editor**에서 순서대로 실행:
   - `supabase/migrations/001_init.sql`
   - `supabase/seed.sql`
   - `supabase/migrations/002_member_consent.sql` (회원 약관 동의 컬럼)
   - `supabase/migrations/003_sheet_files.sql` (악보 `pdf_url`/`preview_url` + Storage 버킷 `sheets`)
   - `supabase/migrations/004_preview_urls.sql` (**필수** · 미리보기 최대 2장 `preview_urls text[]`)
   - `supabase/migrations/005_youtube_url.sql` (유튜브 URL 컬럼)
   - `supabase/migrations/006_banner_images.sql` (**필수** · 배너 `image_url` + Storage 버킷 `banners`)
   - `supabase/migrations/007_banner_sheet_id.sql` (배너 ↔ 악보 연동 `sheet_id`)
   - `supabase/migrations/008_banner_mobile_image.sql` (배너 모바일 이미지 `image_url_mobile`)
   - `supabase/migrations/009_member_provider_identity.sql` (**필수** · 카카오/네이버 동일 이메일 회원·약관 분리)
   - `supabase/migrations/010_member_birth.sql` (회원 생년월일 `birth` · 내정보수정/아이디찾기)
   - `supabase/migrations/011_order_provider_identity.sql` (**필수** · 주문/다운로드 `auth_user_id`·`auth_provider` 분리)
   - `supabase/migrations/012_order_multi_provider_email_fix.sql` (**필수 if 동일 이메일로 이메일+카카오+네이버 병행** · null/잘못된 주문을 이메일 회원에만 귀속)
   - `supabase/migrations/013_storage_pdf_private.sql` (**런칭 필수** · PDF private + Storage 쓰기 admin 전용)
   - `supabase/migrations/014_rls_hardening.sql` (**런칭 필수** · anon 오픈 쓰기 제거 · `is_admin()` · guest lookup RPC)
3. **Project Settings → API**에서 복사:
   - Project URL
   - `anon` `public` key

## 2. 키 설정 (필수)

브라우저 정적 서버는 `.env`를 읽지 않으므로 **`html/shared/config.js`**에 직접 넣습니다.

```js
window.CHODRUM_CONFIG = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi...',
  KAKAO_CLIENT_ID: '',
  KAKAO_OAUTH_MODE: 'bridge',
  NAVER_CLIENT_ID: '',
  NAVER_OAUTH_MODE: 'bridge',
  ADMIN_ID: 'admin',
  ADMIN_EMAIL: 'admin@yourdomain.com', // Supabase Auth 관리자 이메일
  ADMIN_PASSWORD: '',                 // Auth 비밀번호 (운영 전 변경)
  TOSS_CLIENT_KEY: '',                // 토스 가입 후 설정 (비우면 데모 결제)
  TOSS_MODE: 'auto',
  TOSS_CONFIRM_URL: '',               // 비우면 SUPABASE_URL/functions/v1/toss-confirm 자동
  SHEET_DOWNLOAD_URL: '',             // 비우면 .../functions/v1/sheet-download 자동
};
```

참고용 템플릿: 루트 `.env.example`

**주의:** `service_role` 키와 토스 **Secret Key** 는 HTML에 넣지 마세요.

## 3. 연결된 데이터 흐름

| 테이블 | BO (쓰기/관리) | FO (읽기/생성) |
|--------|----------------|----------------|
| `sheets` | 악보 목록·등록·수정·삭제·상태 · PDF/미리보기 URL | 홈 / 목록 / 상세 (판매중만) |
| Storage `sheets` | BO 관리자 JWT로 PDF·미리보기 업로드 (013 · private) | 미리보기: signed URL · PDF: `sheet-download` Edge |
| Storage `banners` | BO 관리자 JWT 업로드 | 배너 public URL 읽기 |
| `featured_sheets` | 추천 관리 저장 | 홈 「추천 악보」 |
| `home_promo` | (시드) 홈 프로모 | 홈 상단 추천 배너 |
| `banners` | 배너 관리 CRUD + `image_url` + `image_url_mobile` + `sheet_id` | FO 홈 메인 배너 (`<picture>` · PC/모바일 이미지) |
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

- **Site URL (로컬):** `http://localhost:8765`
- **Site URL (운영):** `https://renewal.chodrum.com`
- **Redirect URLs:**
  - `http://localhost:8765/fo/FO-08-auth-callback.html`
  - `http://127.0.0.1:8765/fo/FO-08-auth-callback.html` (로컬 대체)
  - `https://renewal.chodrum.com/fo/FO-08-auth-callback.html`
  - `https://renewalchodrum.vercel.app/fo/FO-08-auth-callback.html`
  - (선택) `http://localhost:8765/fo/**` · `https://renewal.chodrum.com/fo/**`

`config.js`는 `127.0.0.1`만 `localhost`로 바꿔 주며, 프로덕션 호스트에는 영향을 주지 않습니다.

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
| Google | Dashboard에서 Enable 시 활성 | Supabase 기본 Provider |
| Kakao | `KAKAO_CLIENT_ID` + Edge Function 설정 시 활성 | **bridge**(기본) 또는 Dashboard Provider |
| Naver | `NAVER_CLIENT_ID` + Edge Function 설정 시 활성 | **bridge**(기본) 또는 Custom Provider |

### 5-1. Redirect URL (필수)

앱 콜백: `/fo/FO-08-auth-callback.html`  
(`config.js`가 `127.0.0.1` → `localhost`로 리다이렉트하므로 로컬은 **localhost** 기준)

Supabase Redirect URLs에 등록:

- `http://localhost:8765/fo/FO-08-auth-callback.html`
- `https://renewal.chodrum.com/fo/FO-08-auth-callback.html`
- `https://renewalchodrum.vercel.app/fo/FO-08-auth-callback.html`

카카오·네이버 Developers Callback에도 **동일 URL**을 등록하세요.

### 5-2. Google

1. [Google Cloud Console](https://console.cloud.google.com/) → OAuth 클라이언트 (웹)
2. 승인된 리디렉션 URI: `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
3. **Supabase → Authentication → Providers → Google** → Enable → Client ID/Secret

### 5-3. Kakao (권장: bridge 모드)

Supabase Dashboard Kakao Provider 없이도 동작합니다.  
**Edge Function `kakao-auth`** 가 코드를 교환하고 Supabase 세션을 만듭니다.

#### A. 카카오 Developers

1. [Kakao Developers](https://developers.kakao.com/) 앱 등록
2. **카카오 로그인** ON
3. Redirect URI (콜백과 일치):
   - 로컬: `http://localhost:8765/fo/FO-08-auth-callback.html`
   - 운영: `https://renewal.chodrum.com/fo/FO-08-auth-callback.html`
   - Vercel: `https://renewalchodrum.vercel.app/fo/FO-08-auth-callback.html`
4. 동의 항목: `profile_nickname`, `profile_image`, **`account_email`(필수)**  
   이메일은 비즈앱/개인사업자 등록이 필요할 수 있습니다.
5. **REST API 키** / (사용 시) Client Secret 복사

#### B. config.js

```js
KAKAO_CLIENT_ID: '카카오_REST_API_키',
KAKAO_OAUTH_MODE: 'bridge',
```

#### C. Edge Function 배포

```bash
supabase secrets set KAKAO_CLIENT_ID=... KAKAO_CLIENT_SECRET=...
supabase functions deploy kakao-auth --no-verify-jwt
```

소스: `supabase/functions/kakao-auth/index.ts`

흐름: FO → 카카오 동의 → 콜백 `?code=` → Function → `hashed_token` → `verifyOtp` → (신규면) 약관 → `members` upsert

**카카오 ≠ 네이버 (동일 이메일):** bridge는 연락처 이메일이 같아도 Auth 사용자를 합치지 않습니다.
카카오/네이버 각각 `kakao_id` / `naver_id` 기준이며, 약관 동의도 provider·`auth_user_id` 단위입니다.
`009_member_provider_identity.sql` 적용 후 Edge Function을 재배포하세요.

**구매내역도 provider 분리:** 동일 이메일로 이메일·카카오·네이버를 모두 쓰는 경우
`011` + `012_order_multi_provider_email_fix.sql` 을 SQL Editor에서 실행하세요.
null/`auth_provider` 없는 회원 주문은 **이메일 회원에만** 귀속되고, 카카오/네이버 로그인에서는 보이지 않습니다.

#### D. (선택) Supabase 기본 Kakao Provider

1. Kakao Redirect URI에 `https://<REF>.supabase.co/auth/v1/callback` 추가
2. **Supabase → Authentication → Providers → Kakao** → Enable → REST API 키 / Secret
3. config:

```js
KAKAO_OAUTH_MODE: 'supabase',
```

### 5-4. Naver (권장: bridge 모드)

Supabase에는 네이버 기본 Provider가 없습니다.  
**Edge Function `naver-auth`** 로 코드를 교환하고 Supabase 세션을 만듭니다.

#### A. 네이버 Developers

1. [Naver Developers](https://developers.naver.com/) → 애플리케이션 등록
2. 로그인 오픈 API 사용, **이메일**을 **필수 동의**로
3. Callback URL (서비스 URL과 일치):
   - 로컬: `http://localhost:8765/fo/FO-08-auth-callback.html`
   - 운영: `https://renewal.chodrum.com/fo/FO-08-auth-callback.html`
   - Vercel: `https://renewalchodrum.vercel.app/fo/FO-08-auth-callback.html`
4. **Client ID** / **Client Secret** 복사

#### B. config.js

```js
NAVER_CLIENT_ID: '네이버_Client_ID',
NAVER_OAUTH_MODE: 'bridge',
```

#### C. Edge Function 배포

```bash
# CLI 로그인·프로젝트 링크 후 (따옴표 권장, <> 괄호 넣지 말 것)
supabase secrets set "NAVER_CLIENT_ID=발급받은_Client_ID" "NAVER_CLIENT_SECRET=발급받은_Client_Secret"
supabase functions deploy naver-auth --no-verify-jwt
```

소스: `supabase/functions/naver-auth/index.ts`  
(이미 배포된 경우에도 Client ID/Secret을 바꾼 뒤에는 secrets만 다시 set 하면 됩니다.)

흐름: FO → 네이버 동의 → 콜백 `?code=` → Function이 토큰·프로필 처리 → `hashed_token` → 브라우저 `verifyOtp` → (신규면) 약관 → `members` upsert

카카오와 연락처 이메일이 같아도 **별도 Auth 사용자 + 별도 약관 동의**입니다 (위 카카오 절 참고).

**버튼이 회색이면:** `html/shared/config.js`의 `NAVER_CLIENT_ID`가 비어 있거나, 배포된 `config.js`에 아직 반영되지 않은 상태입니다.

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
# Pretty URLs (/login, /bo/login, …) need vercel.json rewrites.
# Do NOT use plain `python3 -m http.server` — those paths 404.
python3 scripts/serve-local.py
```

1. http://localhost:8765/login — FO 로그인 (또는 `/fo/FO-08-login.html`)
2. http://localhost:8765/signup — 이메일 OTP 가입
3. http://localhost:8765/bo/login — BO 관리자  
   - **Live:** `ADMIN_EMAIL` / `ADMIN_PASSWORD` 로 Supabase Auth 로그인 + `app_metadata.role=admin` (014)  
   - **로컬 데모(키 없음):** `ADMIN_ID` / `ADMIN_PASSWORD` 세션만  
4. 신규 소셜 → `/oauth-terms` → 마이페이지
5. 콘솔: `ChodrumAuth.live() === true`

## 6. 파일 업로드 (Storage)

### 6-1. 악보 (`sheets` 버킷)

BO 악보 등록(`BO-02-sheet-register.html`)에서:

- **PDF 원본** → `sheets` 버킷 `pdf/` 경로 → DB에는 **path** (`pdf/...`) 저장
- **미리보기 이미지** → `preview/` 경로 → 업로드 시 canvas 워터마크 → path 저장 → FO hydrate 시 **signed URL**

마이그레이션 `003`이 버킷을 만들고, **`013_storage_pdf_private.sql`이 버킷을 private로 바꾸며** `pdf/*` 공개 다운로드를 막습니다.  
미리보기(`preview/*`)만 SELECT 허용 · 쓰기는 `is_admin()` JWT만.

**런칭 체크리스트**

1. SQL Editor: `003` → `004` → **`013`** 실행
2. Dashboard → Storage → `sheets` 가 **Private** 인지 확인
3. Edge Function 배포:
   ```bash
   supabase functions deploy sheet-download --no-verify-jwt
   ```
4. FO 다운로드는 `sheet-download`가 ACTIVE 권한을 확인한 뒤 단기 signed URL을 발급합니다.  
   `pdf_url`을 브라우저에서 직접 열면 더 이상 받을 수 없습니다.

### 6-2. 배너 (`banners` 버킷)

(기존과 동일 · Public 버킷 유지)  
`006` → `007` → `008` 실행. **쓰기 정책은 013에서 admin JWT만 허용**으로 바뀝니다.

## 7. 확인 방법 (데이터 FO↔BO)

1. http://127.0.0.1:8765/bo/login — 관리자 Auth 로그인 후 악보 등록 (PDF·미리보기)
2. Table Editor → `sheets` 의 `pdf_url` 이 `pdf/...` path 인지 확인
3. FO 상세 — 미리보기(워터마크) 노출 · PDF 직접 URL 없음
4. 결제(데모) → 마이페이지/비회원 조회에서 PDF 다운로드 (Edge 권한 확인)
5. `ChodrumAPI.mode === 'live'` 이면 Supabase 연결됨

## 7-b. 토스페이먼츠(PG) 결제

FO 체크아웃(`/checkout`)은 **토스페이먼츠** 결제창을 사용합니다.

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com)에서 Client Key / Secret Key 발급  
   (아직 미가입이면 `TOSS_CLIENT_KEY`를 비워 두면 **데모 결제창**으로 동작)
2. `html/shared/config.js`에 `TOSS_CLIENT_KEY` 설정
3. Edge Function 배포 (**Live 결제 시 필수** — confirm 없이 결제완료 처리하지 않음):
   ```bash
   supabase secrets set TOSS_SECRET_KEY=test_sk_...
   supabase functions deploy toss-confirm --no-verify-jwt
   ```
4. `TOSS_CONFIRM_URL`은 비워도 됩니다 → `SUPABASE_URL/functions/v1/toss-confirm` 자동 유도  
   명시하려면: `https://<REF>.supabase.co/functions/v1/toss-confirm`

**흐름**

1. 결제 직전: `orders`에 `status=대기` + 금액/라인아이템 저장 (금액 위변조 대비)
2. 성공 콜백 → `toss-confirm`: DB 금액 대조 → Toss confirm API → `결제완료` + `downloads` 발급
3. 데모(`demo=1`): Toss API 생략, 같은 Edge가 주문·다운로드 생성 (RLS 환경에서도 동작)

성공/실패 콜백: `/payment/success`, `/payment/fail` → 완료 시 `/order-complete`

## 8. 보안 (런칭 전)

### 8-1. RLS (`014_rls_hardening.sql`)

| 대상 | 정책 요약 |
|------|-----------|
| sheets / banners / featured / settings | 공개 읽기 · **쓰기 `is_admin()`만** |
| orders / order_items | 회원은 본인(`auth_user_id`) 읽기 · FO는 `대기` INSERT만 · 결제완료/다운로드는 **service_role(Edge)** |
| downloads | 본인 읽기 · INSERT는 Edge만 |
| members | 본인 읽기/쓰기 · admin 전체 |
| 비회원 조회 | `lookup_guest_orders(email)` RPC (security definer) |

### 8-2. BO 관리자

1. Dashboard → Authentication → Users 에서 관리자 이메일 계정 생성
2. SQL Editor:
   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'YOUR_ADMIN_EMAIL';
   ```
3. `config.js`에 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 설정 후 `/bo/login`
4. anon 키만으로는 더 이상 sheets/banners/orders 쓰기가 되지 않습니다.  
   (비밀번호가 config에 남아 있으면 JS를 읽은 공격자는 로그인 가능 — 운영 전 비밀번호 강화·별도 배포 권장)

### 8-3. Edge Functions 배포 요약

```bash
supabase functions deploy sheet-download --no-verify-jwt
supabase functions deploy toss-confirm --no-verify-jwt
# (+ 기존 kakao-auth / naver-auth)
supabase secrets set TOSS_SECRET_KEY=...
```

OAuth 세션은 브라우저 localStorage에 저장됩니다 (`persistSession: true`).
FO와 BO를 같은 브라우저에서 동시에 쓰면 Auth 세션이 겹칠 수 있습니다 — 관리자는 별도 프로필/시크릿 창을 권장합니다.