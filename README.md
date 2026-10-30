<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b60f2d30-bee8-41ef-a4d9-b1e9422a131a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

The Vercel deployment serves the Vite build from `dist` and routes `/api/*` requests to the Express function in `api/[...path].ts`.

Configure these server-side Environment Variables in Vercel before deploying:

- `GEMINI_API_KEY`: your Google Gemini API key.
- `MONGODB_URI`: the MongoDB Atlas connection string for a database user with access limited to the `mindcalm` database.
- `MONGODB_DB`: `mindcalm` (optional; this is the default).
- `DB_ENCRYPTION_SECRET`: a long random secret. Keep it stable; changing it prevents old encrypted records from being decrypted.

The browser uses a random local anonymous session ID to keep each browser's check-ins, journal entries, and chat separate. This is a demo-level separation mechanism, not account authentication. Do not use it for confidential real-user records without adding authentication and access controls.
