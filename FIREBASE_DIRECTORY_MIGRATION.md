# Firebase directory migration

The portal directory uses Cloud Firestore collection `portalDirectory`, with document IDs equal to Firebase Authentication UIDs. Passwords are never written to the directory. Firebase Authentication handles sign-in. Students now sign in by their assigned email, not by student number. The existing trusted `admins/{uid}` documents continue to bootstrap administrator access.

## Before production cutover

1. Confirm Email/Password is enabled in Firebase Authentication. Confirm a trusted administrator has an existing Firebase Auth user and an `admins/{uid}` document.
2. Deploy the checked-in Firestore rules to the same project configured in Vercel. From an authorized Firebase CLI session: `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`. Do not deploy an unrelated project.
3. Verify the preview using that administrator. Create a test student and lecturer; check the records in Firestore and Authentication, verify the student can read only their own profile and the lecturer can read only their faculty's student profiles. Verify CRUD from another device and suspended/deleted profile access.
4. Provision actual users using the administrator interface. Browser-local demo records are not automatically imported: review them first and re-provision approved people with new passwords. Never reuse or upload the old plaintext demo passwords. Existing Auth users can be associated with a profile by an authorized Firebase administrator in the console.
5. Only after successful verification, merge the migration branch to main and verify production.

## Limitations

A deleted directory profile blocks portal access, but does not delete the underlying Firebase Auth user. Permanent Auth deletion, disabling Auth users, and changing their email/password require trusted Firebase Admin SDK or Console administration. Client-side provisioning uses a separate in-memory Auth instance; accounts without a valid profile cannot access the portal. The UI checks duplicate student numbers and one lecturer per faculty; concurrent uniqueness is not yet enforced by the server. Other draft features (grades, course content, fees, activity logs, and browser-local student request history) are outside this directory migration. Existing Firestore service requests remain intact.
