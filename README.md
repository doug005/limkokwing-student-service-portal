# Limkokwing Student Service Portal

A responsive React application for students at Limkokwing University of Creative Technology in Maseru, Lesotho. It brings six student services into one place and provides a Firestore-backed request workflow for a Web Design II assessment.

The frontend is React, built with webpack and served by a Node.js/Express application. This project does not use Vite. Firebase credentials are intentionally not included. The interface and validation work without Firebase, but a request is not reported as saved unless a real Firestore write succeeds.

## Features

- Home page with a university-focused introduction, service overview, and request steps.
- Six data-driven services with descriptions, departments, processing times, and detail pages.
- Dynamic service routes and a request form that preselects a service chosen from its detail page.
- React validation for student name, student ID, email, service, request date, and request description.
- Confirmation page with the real saved request reference and details after a successful Firestore write.
- Firestore create/read/update/delete operations for `studentRequests`.
- Staff request management with live updates, status counts, search, details, status changes, and confirmed deletion.
- Responsive navigation, accessible field errors, and loading, empty, and failure states.
- Firestore rules that allow validated student request creation while restricting reads, updates, and deletes to approved staff.
- Node.js health endpoint at `/health`; Express serves the SPA and its browser-side routes.

## Technologies

JavaScript, Node.js 20+, React 18, React Router DOM, Express 5, webpack, Firebase JavaScript SDK/Firestore, Lucide icons, HTML5, and CSS3. The app does not use TypeScript or a UI template framework.

## Project structure

```text
.
├── public/                   # Favicon, campus photo, route manifest
├── scripts/
│   ├── build.mjs             # Bundles React/CSS with webpack and copies public assets
│   └── dev.mjs               # Watches client source and starts Node.js server
├── src/
│   ├── components/           # Shared buttons, cards, fields, status, navigation, footer
│   ├── data/                 # Six student service objects
│   ├── layouts/              # Shared routed shell
│   ├── pages/                # Home, services, details, request, confirmation, management
│   ├── services/             # Firebase setup and Firestore/Auth operations
│   ├── styles/               # Responsive design tokens and application CSS
│   ├── utils/                # Date formatting helpers
│   ├── App.jsx                # React Router route tree
│   └── main.jsx               # React entry point
├── dist/                      # Generated production output (not committed)
├── server.js                  # Express static server, health response, SPA fallback
├── index.html                 # React root document template
├── firestore.rules            # Restrictive Firestore security rules
├── firebase.json              # Firebase CLI rules configuration
├── .env.example               # Firebase placeholders only
├── package.json               # Node scripts and pinned toolchain
└── README.md
```

## Run locally with Linux and VS Code

Install Node.js 20 or later and npm 10.9.9 (the package manager version is recorded in `package.json`). From the project folder:

```bash
cd limkoportal
code .
npm ci
npm run dev
```

The development command uses webpack to watch the React/JSX/CSS source and starts the Express server on `http://localhost:3000`. Refresh the browser after a client rebuild; the workflow does not depend on a separate dev-server framework. The server binds to `0.0.0.0` and honours the `PORT` environment variable when one is provided.

Create and run the production bundle with:

```bash
npm run build
npm start
```

`npm run build` writes the compiled React JavaScript and CSS plus public assets to `dist/`. The project uses webpack directly; Vite is not used. `npm start` serves that folder through Node.js/Express. The health endpoint is `GET /health`; React Router page URLs use the Express fallback to `index.html`.

## Firebase Hosting deployment

The repository includes Firebase Hosting configuration. After creating the production bundle, deploy it from the project root:

```bash
npm run build
firebase login
firebase use --add
firebase deploy --only hosting
```

The `firebase.json` file publishes `dist/` and rewrites browser routes such as `/services` and `/requests` to the React app shell. Deploy Firestore rules separately when needed with `firebase deploy --only firestore:rules`.

## Vercel deployment

The frontend can also be hosted on Vercel. Import this repository into Vercel and use the settings in `vercel.json` (`npm run build`, output directory `dist`). Add the six Firebase Web app values from `.env.local` as Vercel environment variables for **Production**, **Preview**, and **Development** as appropriate: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, and `FIREBASE_APP_ID`. Redeploy after adding or changing them. These values are included in the browser bundle by design; never add Firebase Admin credentials or service-account keys.

The Vercel configuration rewrites client-side routes such as `/services` and `/requests` to `index.html`. Firestore rules remain deployed to Firebase and are not deployed by Vercel.

## Firebase project setup

1. In the [Firebase Console](https://console.firebase.google.com/), create or select a Firebase project and register a Web app. Copy its Web SDK configuration values.
2. Copy `.env.example` to `.env.local` in the project root, then replace all placeholders. Use these exact names: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, and `FIREBASE_APP_ID`.
3. Create a Cloud Firestore database. Do not leave it in a permanent test-mode ruleset.
4. Enable **Authentication → Sign-in method → Email/Password** and create an account for trusted request-management staff.
5. Deploy the checked-in rules. Install the Firebase CLI if needed, sign in, select the same project, and deploy only Firestore rules:

   ```bash
   npm install --global firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules
   ```

6. After changing `.env.local`, stop and restart `npm run dev` so the Node build loads the new values. Never commit `.env.local`.

Firebase Web SDK settings are browser configuration values, not authorization. The Firestore rules protect student data. Do not place Firebase Admin SDK service-account keys in `.env.local` or the browser bundle; this app does not use those private credentials.

The included `firestore.rules` allow unsigned students to create requests matching the expected schema and canonical service name. They do not allow the public to list/read requests, change statuses, or delete documents.

### Authorise staff request managers

Create an Email/Password staff user in Firebase Authentication and copy that user's UID. In the Firestore Console, create a document in the `admins` collection whose document ID is exactly that UID. The document may contain a field such as `role: "request-manager"`; its existence grants access. Create admin records through a trusted Firebase Console/Admin SDK workflow; the client rules deny app-side creation or changes to staff grants.

Staff sign in at `/requests`. An account without a matching `admins/{uid}` document cannot read or change requests. Provision access only for trusted staff and use a separate Firebase project for development if possible.

For a public launch, have the university approve the data-retention and access model, deploy App Check and anti-abuse controls, and confirm image reuse rights. The public form's field/schema validation does not by itself prevent automated abuse.

## Firestore collection structure

Collection: `studentRequests`. Each document has a Firestore-generated document ID and these fields:

```text
studentName      string
studentId        string
email            string
serviceId        string
serviceName      string
description      string
requestDate      string (YYYY-MM-DD)
status           string: Pending | In Progress | Completed | Rejected
createdAt        Firestore timestamp (server timestamp)
```

Staff grants use a separate `admins` collection with the Authentication UID as the document ID. The app does not create or modify admin grants.

## CRUD implementation

- **Create:** `createStudentRequest` is called after React validation, writes the request with `Pending` status and a server timestamp, then returns the generated document ID for the confirmation page. If the write fails, the form stays available and displays the error.
- **Read:** `subscribeToStudentRequests` uses a Firestore snapshot listener so the authorised request list updates when the collection changes.
- **Update:** `updateStudentRequestStatus` accepts only `Pending`, `In Progress`, `Completed`, or `Rejected` and changes only the status field.
- **Delete:** `deleteStudentRequest` removes a record after browser confirmation. Firestore rules independently restrict management operations to approved staff.

## Notes for assessment

- Required services are stored in `src/data/services.js` and rendered through the reusable `ServiceCard` component.
- `PageHeader`, `ServiceCard`, `FormField`, `Button`, and `StatusBadge` receive their displayed data through props.
- `useState` drives form, search, navigation, and management interactions. `useEffect` handles authentication, Firestore subscriptions, and route behavior.
- React Router includes a nested shared layout, dynamic `/services/:serviceId`, programmatic navigation after a successful save, and a catch-all 404.
- The Express server serves the React build; Firestore operations use the Firebase Web SDK from the browser. Live Firestore writes, staff sign-in, and CRUD have not been verified because Firebase project configuration was not supplied. Configure Firebase and deploy the rules before demonstrating the backend.

## Campus photo credit

The homepage hero uses a 2048 × 1365 campus photo saved as `public/images/limkokwing-campus-hero.jpg`. A higher-resolution copy was retrieved from a public Limkokwing Lesotho Facebook photo: [source](https://www.facebook.com/photo.php?fbid=638526601652695&set=a.638526594986029&type=3). Confirm reuse rights before publication.
