# Jhovey's Touch booking

A bilingual (English/Arabic) appointment-request website for Jhovey's Touch, built with Next.js, Firebase Firestore, and ready to deploy on Vercel.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add the Firebase Admin credentials (see below).
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

## Firebase setup

1. Create a Firebase project and enable **Cloud Firestore**.
2. Create a service account with the **Cloud Datastore User** role. Use its project ID, service-account email, and private key for the environment variables below. Keep the private key secret; it is only read by the server.
3. Create a Firestore database, then publish the rules in [`firestore.rules`](./firestore.rules). The browser cannot read or write appointment documents directly; the server endpoint uses the Admin SDK.
4. Set these variables in `.env.local` for local development and in the Vercel project's **Settings → Environment Variables** for deployments:

   | Variable | Value |
   | --- | --- |
   | `FIREBASE_PROJECT_ID` | Firebase project ID |
   | `FIREBASE_CLIENT_EMAIL` | Service-account email |
   | `FIREBASE_PRIVATE_KEY` | Service-account private key, including its PEM header and footer |

   For Vercel, paste the private key with its line breaks. If your environment stores escaped newlines, the server converts `\n` into real line breaks.

Appointment requests are stored in the `appointmentRequests` collection with `status: "pending"` and a server-generated creation time. Each request includes a `services` array and a comma-separated `service` field for compatibility with older consumers. Requests are not bookings until the salon confirms availability with the customer.

## Deploy to Vercel

Import the repository into Vercel, add the Firebase environment variables for the target deployment environment, and deploy. Vercel detects and builds the Next.js app automatically. Redeploy after changing environment variables.

## Project scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run build` — production build
