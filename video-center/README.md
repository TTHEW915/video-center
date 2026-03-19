# Video Distribution Center

Upload once, publish everywhere. Currently supports YouTube with more platforms coming.

## Setup

1. Clone this repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and fill in your keys
4. Run `npm run dev`

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Add your environment variables in Vercel settings
4. Deploy!

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
