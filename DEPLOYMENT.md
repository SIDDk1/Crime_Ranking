# Deployment Notes

## Backend

Set these environment variables on your deployed backend service:

- `MONGO_URI`
  Example: `mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/?retryWrites=true&w=majority&appName=CrimeRanking`
- `MONGO_DB_NAME`
  Example: `CrimeRankingDB`

The backend already falls back to local MongoDB for development, so your local setup can keep using `backend/.env`.

## Frontend

Set this environment variable on your deployed frontend:

- `VITE_API_URL`
  Example: `https://your-backend-service.onrender.com`

## Recommended setup

1. Create a MongoDB Atlas cluster.
2. Create a database user and allow your hosting provider IPs or `0.0.0.0/0` during setup.
3. Copy the Atlas connection string into the backend service `MONGO_URI`.
4. Set `MONGO_DB_NAME=CrimeRankingDB` on the backend.
5. Redeploy the backend.
6. Set `VITE_API_URL` on the frontend to your deployed backend URL and redeploy the frontend.
