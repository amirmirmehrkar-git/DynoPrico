# DynoPrice Decision Engine

DynoPrice is a pitch-ready MVP dashboard for transparent dynamic pricing decisions on perishable inventory. It shows how product risk, expiry urgency, weather, traffic, channel demand, nearby events, and sales pace influence local and delivery pricing recommendations.

## Demo

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What It Shows

- Editable decision factors and weights
- Local and delivery price recommendations per product
- Product-level explainability in a separate analysis view
- Channel-specific actions for local, delivery, partner, and POS/display systems
- Mock API route at `/api/recommendations`

## Tech Stack

- Next.js
- React
- TypeScript
- Local mock data and transparent scoring logic
