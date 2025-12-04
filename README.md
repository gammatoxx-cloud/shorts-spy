# Shorts Spy

A micro-SaaS application for analyzing TikTok creator performance.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe (via Supabase)
- **External API:** Apify TikTok Scraper

## Project Structure

```
/app
  /tiktok
    /[handle]
      page.tsx      # Results page for TikTok username
  layout.tsx        # Root layout with header/footer
  page.tsx          # Landing page
  globals.css       # Global styles
/components         # Reusable components (to be added)
/lib               # Utilities and helpers (to be added)
/types             # TypeScript type definitions (to be added)
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

