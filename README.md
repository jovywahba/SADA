# SADA · Customer Discovery (clickable prototype)

A mock website for presenting the SADA customer-discovery journey. Everything is front-end only:
no real authentication, Calendly, calendar, email or analytics.

## Run

```bash
npm install
npm run dev        # http://localhost:5178
```

## Demo accounts (password `123456Sada`)

- `user@sada.app` → Welcome video → Questionnaire → Book a Call (mock Calendly) → Done
- `admin@sada.app` → Admin dashboard with mock numbers and a mock user table

## Where things live

- Questions: `src/lib/questions.ts`
- Mock admin data: `src/pages/Admin.tsx`
- Mock login accounts: `src/lib/auth.ts`
- Video: `public/media/sada-intro.mp4` · Logo: `public/brand/sada-mark.png`
