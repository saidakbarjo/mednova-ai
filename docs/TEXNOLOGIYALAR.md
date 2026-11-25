# MEDNOVA AI — saytda işlatilgan texnologiyalar va fayllar

**Loyiha:** MEDNOVA AI — aqlli tibbiyot platformasi (universitet loyihasi)
**Mualliflar:** Saidakbar va Zuxra
**Jonli sayt:** https://mednova-ai-seven.vercel.app
**Kod (GitHub):** https://github.com/saidakbarjo/mednova-ai

---

## 1. Umumiy arxitektura

Sayt bitta **Next.js** ilovasi sifatida qurilgan: foydalanuvçi körayotgan sahifalar (frontend) ham, ma’lumotlar bilan işlaydigan server qismi (backend, REST API) ham bir loyihada joylaşgan.

```
Brauzer (React sahifalar)
   │  fetch / JSON
   ▼
Next.js API (src/app/api/*)  ──►  Xavfsizlik: JWT cookie, rollar, rate limit, zod tekşiruv
   │
   ├──► Ma’lumotlar bazasi: PostgreSQL (Supabase) yoki PGlite (demo)
   └──► AI yordamçi: xavfsizlik qatlami → Anthropic Claude (kalit bölsa) yoki demo bilimlar bazasi
```

---

## 2. Asosiy texnologiyalar (stack)

| Qatlam | Texnologiya | Versiya | Nima uçun işlatilgan |
|---|---|---|---|
| Freymvork | **Next.js** (App Router) | 14.2 | Sahifalar, marşrutlaş, server API (Route Handlers), middleware |
| UI kutubxona | **React** | 18.3 | Interfeys komponentlari |
| Dasturlaş tili | **TypeScript** (strict) | 5.9 | Xatolarni kod yozilayotganda uşlaş |
| Dizayn | **Tailwind CSS** | 3.4 | Barça stil, qoronği rejim (dark mode), moslaşuvçan dizayn |
| Animatsiya | **Framer Motion** | 11 | Sahifa animatsiyalari, kartoçkalar harakati, yurak urişi grafigi |
| Grafiklar | **Recharts** | 2.15 | Qon bosimi, puls, vazn, admin statistikasi grafiklari |
| Ikonkalar | **Lucide React** | — | Barça ikonkalar |
| Şriftlar | **Inter**, **Plus Jakarta Sans** (Fontsource) | 5.3 | Matn va sarlavha şriftlari, internetsiz ham yuklanadi |
| Ma’lumotlar bazasi | **PostgreSQL** (`pg` drayveri) / **Supabase** | 8.23 | Doimiy ma’lumotlar (Supabase ulanganda) |
| Demo baza | **PGlite** (WebAssembly’dagi PostgreSQL) | 0.2 | Serversiz demo rejim, sozlaşsiz işlaydi |
| Validatsiya | **Zod** | 3.25 | Kelgan barça ma’lumotlarni tekşiriş |
| Autentifikatsiya | **jose** (JWT, HS256) | 5.10 | Kirişdan keyingi sessiya (httpOnly cookie) |
| Parol himoyasi | **bcryptjs** | 2.4 | Parollarni xeşlab saqlaş |
| Sun’iy intellekt | **Anthropic Claude API** (ixtiyoriy) | — | AI yordamçi javoblari; kalit bölmasa — demo bilimlar bazasi |
| Hosting | **Vercel** | — | Saytni internetga çiqariş |
| Kod saqlaş | **GitHub** + **GitHub Actions** (CI) | — | Har yuklaşda avtomatik tekşiruv: typecheck, lint, build, API testlar |
| Yordamçi | ESLint, PostCSS, Autoprefixer, tsx | — | Kod sifati, CSS moslaşuvi, skriptlarni işga tuşiriş |

---

## 3. Saytdagi asosiy imkoniyatlar

### 3.1. Uç xil rol
- **Bemor** — şifokor topiş, qabulga yoziliş, qabulni köçiriş/bekor qiliş, tibbiy yozuvlar, körsatkiçlar (qon bosimi, puls, vazn), şifokorga baho va şarh qoldiriş, AI yordamçi.
- **Şifokor** — bugungi jadval, qabullarni tasdiqlaş/yakunlaş, bemorlar röyxati, kalendar, tibbiy yozuv qöşiş.
- **Administrator** — umumiy statistika va grafiklar, foydalanuvçilarni boşqariş (bloklaş), yangi şifokorlarni tasdiqlaş.

### 3.2. Til va dizayn
- 4 til: **özbek (yangi alifbo)**, **özbek (eski alifbo)**, **rus**, **ingliz** — har birida 843 ta matn kaliti.
- Qoronği / yoruğ rejim.
- **Ctrl + K** buyruqlar paneli (tezkor qidiruv).
- Tibbiy yozuvlarni çop etiş / PDF saqlaş.
- Telefon, planşet va kompyuterga moslaşgan dizayn.

### 3.3. AI yordamçi (ta’limiy)
- Avval **xavfsizlik qatlami**: favqulodda holatni (köks oğriği, nafas qisiliş va h.k.) özbek, rus va ingliz tillarida taniydi va **103** ga qönğiroq qiliş kerakligini aytadi.
- Dori **dozasini aytmaydi**, **taşxis qöymaydi**.
- Anthropic kaliti bölsa — Claude modeli javob beradi; bölmasa — 22 mavzuli, 3 tilli **demo bilimlar bazasi**.
- Javob tilini xabarning özidan aniqlaydi.

### 3.4. Xavfsizlik
- Parollar bcrypt bilan xeşlanadi, sessiya httpOnly JWT cookie’da.
- Middleware rollar böyiça sahifalarni himoya qiladi.
- Barça kiriş ma’lumotlari Zod bilan tekşiriladi.
- Sörovlar soni çeklanadi (rate limit).
- Xavfsizlik HTTP sarlavhalari (CSP, X-Frame-Options va h.k.).
- Supabase’da **Row Level Security (RLS)** qoidalari.

### 3.5. Universitet taqdimoti rejimi
`/presentation` sahifasi: arxitektura sxemasi, ma’lumotlar bazasi diagrammasi (ERD), API hujjatlari, demo hisoblar va mualliflar.

---

## 4. Ma’lumotlar bazasi (11 ta jadval)

| Jadval | Mazmuni |
|---|---|
| `users` | Barça foydalanuvçilar (email, parol xeşi, rol, til) |
| `specializations` | Tibbiy yönalişlar (kardiologiya, nevrologiya …) |
| `doctors` | Şifokor profili, tajriba, narx, reyting |
| `patients` | Bemor profili (qon guruhi, böy, vazn …) |
| `appointments` | Qabullar (sana, holat, sabab) |
| `doctor_availability` | Şifokorning iş vaqti |
| `medical_records` | Tibbiy yozuvlar, tahlillar, körsatkiçlar |
| `ai_conversations` | AI bilan suhbatlar |
| `ai_messages` | Suhbat xabarlari |
| `notifications` | Bildirişnomalar (köp tilli kalit + parametrlar) |
| `reviews` | Şifokorlarga baho va şarhlar |

Fayllar: `supabase/migrations/001_schema.sql`, `002_row_level_security.sql`, `003_reviews_and_i18n.sql`, `004_reviews_rls.sql`.

---

## 5. REST API (24 ta manzil)

| Guruh | Manzillar |
|---|---|
| Autentifikatsiya | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` |
| Şifokorlar | `/api/doctors`, `/api/doctors/[id]`, `/api/doctors/[id]/slots`, `/api/doctors/[id]/reviews`, `/api/specializations` |
| Qabullar | `/api/appointments`, `/api/appointments/[id]` |
| Bemor | `/api/patients/profile`, `/api/patients/records` |
| Şifokor | `/api/doctor/patients` |
| AI | `/api/ai/chat`, `/api/ai/conversations`, `/api/ai/conversations/[id]`, `/api/ai/symptom-information` |
| Admin | `/api/admin/users`, `/api/admin/users/[id]`, `/api/analytics/overview` |
| Boşqa | `/api/notifications`, `/api/reviews`, `/api/health` |

---

## 6. Fayllar tuzilmasi

```
mednova-ai/
├── src/
│   ├── app/                 — sahifalar va API
│   │   ├── page.tsx         — bosh sahifa
│   │   ├── login/, register/ — kiriş va röyxatdan ötiş
│   │   ├── doctors/         — şifokorlar katalogi va profil sahifasi
│   │   ├── dashboard/       — kabinetlar: patient/, doctor/, admin/, assistant/, profile/
│   │   ├── presentation/    — universitet taqdimoti sahifasi
│   │   └── api/             — 24 ta REST API manzil
│   ├── components/          — qayta işlatiladigan komponentlar
│   │   ├── marketing/       — bosh sahifa bölimlari (Hero, FAQ, header, footer)
│   │   ├── dashboard/       — kabinet qobiği, grafiklar, modallar, Ctrl+K paneli
│   │   ├── doctors/         — şifokorlar katalogi, qabulga yoziliş vidjeti
│   │   ├── presentation/    — ERD diagramma, API spetsifikatsiyasi
│   │   └── ui/              — tugmalar, kartoçkalar va boşqa bazaviy elementlar
│   ├── lib/                 — server mantiği
│   │   ├── db.ts            — baza ulaniş (Postgres yoki PGlite), migratsiyalar
│   │   ├── seed.ts          — demo ma’lumotlar
│   │   ├── auth.ts, session.ts — parol, JWT, sessiya
│   │   ├── validation.ts    — Zod sxemalari
│   │   ├── rate-limit.ts    — sörovlar çeklovi
│   │   └── ai/              — safety.ts (xavfsizlik), knowledge.ts (bilimlar), assistant.ts
│   ├── i18n/                — tillar: dict/uz.ts, ru.ts, en.ts va sozlamalar
│   └── middleware.ts        — rollar böyiça himoya
├── supabase/migrations/     — SQL sxema va RLS qoidalari
├── scripts/                 — api-test.ts (78 ta tekşiruv), db-reset.ts
├── docs/                    — inglizça README, işlab çiqiş hisoboti, şu hujjat
├── .github/workflows/ci.yml — avtomatik tekşiruv
├── package.json             — kutubxonalar röyxati
├── next.config.mjs, tailwind.config.ts, tsconfig.json — sozlamalar
└── README.md                — özbekça qöllanma
```

Jami: **116 ta fayl**, taxminan **15 500 qator kod**.

---

## 7. Demo hisoblar (parol: `Demo1234!`)

| Rol | Email |
|---|---|
| Bemor | `patient@mednova.demo` |
| Şifokor | `doctor@mednova.demo` |
| Admin | `admin@mednova.demo` |

---

## 8. Kompyuterda işga tuşiriş

1. Node.js 20 örnating.
2. Arxivni oçib, papkada: `npm install`
3. `npm run dev` → brauzerda `http://localhost:3000`
4. Hammasi avtomatik: baza yaratiladi va demo ma’lumotlar yuklanadi. AI kaliti bölmasa ham demo rejimda işlaydi.
