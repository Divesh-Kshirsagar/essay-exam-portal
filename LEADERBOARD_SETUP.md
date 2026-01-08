
# Leaderboard & Backend Setup Guide

This guide explains how to deploy the new **Leaderboard Flow** consisting of a Next.js frontend and a Node.js/Express backend with BullMQ.

## Architecture

1.  **Frontend**: Next.js App Router (`/app/leaderboard`).
2.  **Backend**: Express Server (`/exam-portal-backend`).
3.  **Database**: Firebase Firestore.
4.  **Queue**: Redis + BullMQ (Handles asynchronous grading).

## 1. Backend Deployment (Railway)

The backend handles essay submission queuing and processing.

1.  **Repository Reference**: The backend code is in `exam-portal-backend`.
2.  **Service Setup**:
    - Create a new Service in Railway pointing to this repo/directory.
    - Set the **Root Directory** to `exam-portal-backend` (if mono-repo) or deploy the folder as a separate repo.
3.  **Redis (Upstash)**:
    - Create a Redis database on [Upstash](https://upstash.com/).
    - Copy the `rediss://` connection string.
4.  **Environment Variables**:
    - `PORT`: `3001` (or Railway default)
    - `REDIS_URL`: Paste the Upstash connection string.
    - `FIREBASE_SERVICE_ACCOUNT_KEY`: The contents of your Firebase Service Account JSON file.
5.  **Build Command**: `npm install`
6.  **Start Command**: `npm start` (Runs `node server.js`).
    *Note*: To run the worker, you can update the start command to `node server.js & node workers/essayWorker.js` OR deploy a second service for the worker using the same repo/env vars but with start command `npm run worker`.

## 2. Frontend Deployment (Vercel)

The frontend is your standard Next.js app.

1.  **Environment Variables**:
    - Ensure your Firebase Client variables (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) are set in Vercel.
    - If you are doing server-side fetching with `firebase-admin` in `page.tsx`, ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is also present (if using `lib/firebaseDelegate` logic there), OR rely on the client SDK logic implemented.
2.  **API URL**:
    - Update the fetch URL in `/src/lib/handleSubmit.ts` to point to your deployed Backend URL instead of `http://localhost:3001`.
    - Recommended: Add `NEXT_PUBLIC_BACKEND_URL` to `.env` and use it in `handleSubmit.ts`.

## 3. Local Development

1.  **Configure Redis**:
    - Ensure your `exam-portal-backend/.env` file has the `REDIS_URL` set to your Upstash instance.
2.  **Start Backend**:
    ```bash
    cd exam-portal-backend
    npm run dev
    ```
3.  **Start Worker**:
    ```bash
    cd exam-portal-backend
    npm run worker
    ```
4.  **Start Frontend**:
    ```bash
    cd exam-portal
    npm run dev
    ```

## 4. Verification

1.  Go to `/exam` and submit an essay.
2.  Check the backend logs; you should see "Processing submission...".
3.  Go to `/leaderboard` (wait ~30s for the first poll or refresh) to see the score.
