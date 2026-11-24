# MEDNOVA AI — Aqlli tibbiyot platformasi (v2)

> Universitet loyihasi · **Saidakbar va Zukhra**

MEDNOVA AI **bemorlar**, **şifokorlar** va **administratorlarni** bitta platformada birlaştiradi: tasdiqlangan şifokorlarni qidiriş, real vaqtda qabulga yoziliş, tibbiy yozuvlar, sharhlar, salomatlik diagrammalari va xavfsiz ta’limiy AI yordamçi.

> ⚠️ Bu ta’limiy loyiha: taşxis qöymaydi va şoşilinç yordam körsatmaydi. Barça odamlar va tibbiy ma’lumotlar **xayoliy**. Favqulodda holatda — **103**.

**Jonli demo:** Vercel’da (havola quyida, deploy’dan keyin) · **Kod:** https://github.com/saidakbarjo/mednova-ai

[![CI](https://github.com/saidakbarjo/mednova-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/saidakbarjo/mednova-ai/actions)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saidakbarjo/mednova-ai&env=JWT_SECRET)

## 1. Tezkor işga tuşiriş (sozlamasiz)

Talab: **Node.js 18.18+** (20 yoki 22 tavsiya etiladi).

```bash
npm install
npm run dev          # http://localhost:3000
```

Birinçi sörovda ilova PostgreSQL sxemasini yaratadi va xayoliy demo ma’lumotlarni yuklaydi (**PGlite** — WebAssembly’dagi haqiqiy PostgreSQL, `./.data/` papkasida). Ma’lumotlarni qayta tiklaş: serverni töxtating, `.data` papkasini öçiring va qayta işga tuşiring.

### Demo hisoblar (parol: `Demo1234!`)

| Rol | Email | Nimani körasiz |
|---|---|---|
| Bemor | `patient@mednova.demo` | Sardor Aminov — 8 oylik körsatkiçlar, tahlillar, qabullar, sharhlar |
| Şifokor | `doctor@mednova.demo` | Dr. Malika Hasanova (kardiologiya) — bugungi jadval, bemorlar, kalendar |
| Admin | `admin@mednova.demo` | Tahlil, foydalanuvçilar, tasdiqlaşni kutayotgan 2 şifokor |

## 2. v2 da nima yangi

- **3 til, 2 alifbo**: özbek (yangi lotin — ö, ğ, ş, ç — standart), özbek (amaldagi lotin — avtomatik konvertatsiya), rus, ingliz. Interfeys, API xato xabarlari, bildirişlar va **AI yordamçi** — hammasi tarjima qilingan. Tilni 🌐 belgisi orqali almaştiring.
- **AI yordamçi uç tilda**: özbekça/ruscha savollarni tuşunadi, şoşilinç belgilarni (masalan, «kökragimda oğriq, çap qölimga tarqalyapti», «не могу дышать») taniydi va 103 ga yönaltiradi; doza sörovlarini rad etadi.
- **Yoruğ / qoronği mavzu** (tizim sozlamasiga mos, miltillamaydi).
- **Bemor sharhlari**: yakunlangan qabulni 1–5★ baholaş, şifokor reytingi avtomatik yangilanadi; yangi `reviews` jadvali (jami 11 jadval).
- **Ctrl+K buyruqlar palitrasi**: istalgan sahifaga ötiş, şifokor qidiriş, mavzuni almaştiriş.
- **Yangi dizayn**: aurora fonlar, animatsion hisoblagiçlar, yönalişlar lentasi, bento grid, FAQ, sahifa ötiş animatsiyalari, gradient kartalar.
- **Qöşimça**: tibbiy yozuvlarni çop etiş / PDF, AI javoblari «yozuv maşinkasi» effekti va nusxa oliş, şifokorlarni saralaş, profil töliqligi körsatkiçi, qabulgaça qolgan kunlar, PWA manifest.
- Narxlar **söm**da; demo ma’lumotlar özbekça (Toşkent, Samarqand, Buxoro, Namangan).

## 3. Supabase bilan işlatiş (production)

1. Supabase loyihasini yarating.
2. **SQL Editor**’da ketma-ket bajaring: `001_schema.sql`, `003_reviews_and_i18n.sql`, `002_row_level_security.sql`, `004_reviews_rls.sql` (001 va 003 ilova işga tuşganda avtomatik ham bajariladi).
3. Muhit özgaruvçilari:

```bash
DATABASE_URL=postgresql://postgres.xxxx:PAROL@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
JWT_SECRET=$(openssl rand -base64 48)
ANTHROPIC_API_KEY=        # ixtiyoriy; bölmasa AI demo rejimda işlaydi
```

4. `npm run build && npm start` yoki Vercel’ga deploy. Vercel’da `DATABASE_URL` bölmasa, ilova demo rejimda işlaydi (PGlite `/tmp` da, server qayta işga tuşganda ma’lumotlar qayta yuklanadi); doimiy ma’lumot uçun Supabase ulang.

Productionda sessiya cookie’si `Secure` — sayt **HTTPS** orqali oçilişi kerak (`localhost` mumkin).

## 4. Arxitektura

```
Brauzer (React, Tailwind, Framer Motion, Recharts, i18n)
   │ fetch /api/*  (httpOnly cookie + mednova_lang cookie)
   ▼
Edge middleware — JWT tekşiruvi, rollar böyiça kabinetlar
   ▼
REST API (Next.js Route Handlers)
   ├─ requireUser(role…)  bazaga asoslangan RBAC
   ├─ Zod validatsiya     xatolar foydalanuvçi tilida
   ├─ biznes qoidalari    vaqtlar, holat ötişlari, sharhlar
   └─ AI xizmati          xavfsizlik qatlami → LLM yoki bilimlar bazasi (uz/ru/en)
   ▼
src/lib/db.ts — parametrlangan SQL, tranzaksiyalar
   ▼
PostgreSQL — Supabase yoki PGlite
```

**i18n**: `src/i18n/` — `dict/uz.ts`, `dict/ru.ts`, `dict/en.ts` (har birida 843 kalit), `config.ts` (alifbo konvertori), `format.ts` (özbekça sana/oy nomlari). Bildirişlar bazada kalit + parametr sifatida saqlanadi va har bir foydalanuvçiga öz tilida körsatiladi.

## 5. Testlar

```bash
npm run dev            # bir terminalda
npm run test:api       # ikkinçisida — 78 ta end-to-end tekşiruv
npm run typecheck && npm run lint && npm run build
```

Testlar: autentifikatsiya, RBAC, yoziliş qoidalari, sharhlar, tarjima qilingan xatolar, özbek/rus tilidagi şoşilinç holatni aniqlaş, eski alifboga konvertatsiya va boşqalar. PGlite va haqiqiy PostgreSQL 16 da tekşirilgan.

## 6. Xavfsizlik

bcrypt (cost 12) · httpOnly/SameSite JWT sessiyalar (8 soat) · har sörovda bazadan RBAC · admin klinik yozuvlarni öqiy olmaydi · Zod + baza CHECK çeklovlari · faqat parametrlangan SQL · rate limiting · xavfsizlik sarlavhalari · XSS-xavfsiz suhbat · AI: deterministik şoşilinç aniqlaş (3 tilda), doza/retsept rad etiladi.

To‘liq API qöllanmasi, ERD va namoyiş ssenariysi: **/presentation**. Inglizça README: `docs/README.en.md`.

---

**Loyihalaştirgan va işlab çiqqan: Saidakbar va Zukhra** — MEDNOVA AI
