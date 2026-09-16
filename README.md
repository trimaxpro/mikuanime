# MikuAnime

A modern, high-performance anime streaming discovery platform built with Vite, React 18, TypeScript, Tailwind CSS, and Vercel Serverless Functions.

## 🚀 Features

- **Blazing Fast Performance**: Zero-lag UI with optimized rendering, inline dark styles to prevent white reload flashes, and code splitting.
- **AniList GraphQL Metadata Engine**: Fast, comprehensive anime catalog with trending, seasonal, top-rated, and upcoming titles.
- **Multi-Source Streaming & Video Player**: Responsive video player with multiple server fallbacks (Anixo, VidLink, EmbedAnime, MegaCloud, etc.), episode navigation, auto-next, and SUB/DUB track selection.
- **Comprehensive Search & Discovery**: Real-time debounce search, multi-filter browse (genres, formats, seasons, years), and category pages.
- **Watch History & Watchlist**: Client-side persisted watch progress, resume watching, and custom watchlist tracking.
- **Firebase Authentication**: Optional sign in and account management with personalized profile avatars and secure local token handling.
- **Responsive Modern Design**: Hatsune Miku themed dark glassmorphism aesthetic with polished micro-interactions and mobile drawer navigation.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router 6, TanStack Query (React Query)
- **Styling**: Tailwind CSS, Lucide React, Framer Motion
- **Backend / API**: Vercel Serverless Functions (Node.js/TypeScript)
- **Data Providers**: AniList GraphQL API, AniSkip API, Nekos Best
- **Deployment**: Vercel

## 📦 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/trimaxpro/mikuanime.git
   cd mikuanime
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server (runs both Vite frontend and local API dev proxy concurrently):
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## ☁️ Vercel Deployment

This project is pre-configured for one-click Vercel deployment via `vercel.json` and native Serverless Functions under `/api`:

1. Push this repository to your GitHub account (`trimaxpro/mikuanime`).
2. Go to [Vercel](https://vercel.com) and click **Add New... -> Project**.
3. Import the `mikuanime` repository.
4. Leave the Framework Preset as **Vite** (Vercel will auto-detect `vite build` and the `dist` output directory).
5. (Optional) Set any environment variables in Vercel project settings:
   - `ADMIN_SECRET`: Optional secret token for `/api/clearcache` endpoint.
   - `VITE_FIREBASE_*`: Firebase configuration keys if using remote auth.
6. Click **Deploy**.

## 📄 License

MIT License. Designed for personal and educational use.
