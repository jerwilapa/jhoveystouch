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

## Free email notifications

New appointment requests can notify the salon by email using Resend's free tier. SMS providers generally charge for message delivery, so email is the free option. Notification setup is optional; without it, requests continue to be saved as usual.

1. Create a free account at [Resend](https://resend.com/) and create an API key.
2. Set `RESEND_API_KEY` to that key and `APPOINTMENT_NOTIFICATION_EMAIL` to the address that should receive alerts.
3. For initial testing, set `RESEND_FROM_EMAIL` to `Jhovey's Touch <onboarding@resend.dev>` and use the email address associated with your Resend account as the recipient. To send to another recipient, verify a domain in Resend and use a sender address on that domain instead.
4. Add all three variables to `.env.local` for local development and to the Vercel project's **Settings → Environment Variables**, then redeploy.

Email delivery failures are logged by the server and do not undo a saved appointment request. Resend's free-tier limits and sender verification requirements apply.

Notification emails include tap-to-call and WhatsApp actions. The salon logo is loaded from the deployed site; Vercel deployments use their production URL automatically. For other hosting providers or a custom domain, set `NEXT_PUBLIC_SITE_URL` to the public site origin (for example, `https://example.com`) so email clients can load the logo.

The date/time picker checks `appointmentRequests` for the selected month and disables hourly start times whose service duration overlaps an existing request, including pending requests. Service durations are stored in minutes and combined services add together. New requests store their total `durationMinutes`; older records without a duration are treated as occupying the duration of the requested services. The server checks overlaps again in a Firestore transaction when a request is submitted. The public availability endpoint returns only date/time and duration values, not appointment details. Appointment start times run hourly from 6:00 AM, and each selected service must finish by 10:00 PM.

Default service durations: Haircut (45 min), Blow-dry (30 min), Special occasion hairstyle (90 min), Bridal hairstyle (120 min), Root touch-up (90 min), Full hair color (150 min), Highlights (180 min), Balayage / ombre (210 min), Hair treatment (60 min), Brow shaping & grooming (30 min), Brow threading (15 min), Brow waxing (15 min), Brow tint (20 min), Eyelash extensions (120 min), Classic manicure & pedicure (90 min), Acrylic / gel nail extensions (120 min), French manicure & pedicure (105 min), Nail art & design (60 min), and Nail care (45 min).

## Deploy to Vercel

Import the repository into Vercel, add the Firebase environment variables for the target deployment environment, and deploy. Vercel detects and builds the Next.js app automatically. Redeploy after changing environment variables.

## Project scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run build` — production build
