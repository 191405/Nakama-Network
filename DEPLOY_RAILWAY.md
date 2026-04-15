# Deploying Nakama Network Backend to Railway.app

Deploying to Railway is incredibly fast and works perfectly with your existing Docker setup. Railway automatically spins up a PostgreSQL database and injects the connection credentials into your FastAPI backend.

## Step 1: Push your code to GitHub
Make sure your `backend/` folder (or the entire repository containing it) is pushed to a GitHub repository.

## Step 2: Create a Railway Project
1. Go to [Railway.app](https://railway.app/) and log in with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. If your repository contains both the frontend and backend, when configuring the service, set the **Root Directory** to `/backend`.
5. Railway will automatically detect the `Dockerfile` and begin building it.

## Step 3: Add a PostgreSQL Database
1. Once your backend service is created, click the **New** button in your Railway project canvas.
2. Select **Database** -> **Add PostgreSQL**.
3. Railway will provision a Postgres database instantly.

## Step 4: Configure Environment Variables
You need to pass your environment variables (like API keys) to the backend service.

1. Click on your **Backend Service** box on the Railway canvas.
2. Go to the **Variables** tab.
3. Add the following variables:

- `DATABASE_URL`: For the value, click the magic wand icon (**Reference Variable**) and select `DATABASE_URL` from the Postgres service. This automatically wires the database to the backend!
- `CORS_ORIGINS`: Set this to `https://nk-network-project.web.app` (This is your Firebase frontend URL, ensuring secure connections).
- `GEMINI_API_KEY`: Paste your Google Gemini API key.
- `JWT_SECRET_KEY`: Create a strong random string for user session security.
- `DEBUG`: Set to `false`.

*(Note: Railway automatically provides the `PORT` variable to the container, and our updated Dockerfile will automatically pick it up.)*

## Step 5: Update the Frontend
Once your backend is live, Railway will give it a public URL (e.g., `https://nakama-backend-production.up.railway.app`). 

1. Copy this URL.
2. In your local `.env.local` file (for the frontend), set:
   ```env
   VITE_API_URL=https://nakama-backend-production.up.railway.app
   ```
3. Rebuild and deploy your frontend to Firebase so it points to the new live backend:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

You're done! Your app now has a fully managed production Postgres database and a fast backend.
