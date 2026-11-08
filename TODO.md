# Project outcomes and acceptance criteria

## 1. University portal interface, routes, and responsive design — Complete
- Build a complete, real Limkokwing Student Service Portal for Limkokwing University of Creative Technology, Maseru, Lesotho; do not deliver only a mockup.
- Use JavaScript (not TypeScript), React, React Router DOM, Firebase JavaScript SDK, HTML5 and CSS3, with Node.js/Express serving the app. Use webpack for JSX/CSS bundling. Do not use Vite.
- Create a clean, minimalist, professional university interface with warm white or ivory backgrounds, deep navy or charcoal typography, subtle blue or muted gold accents, generous spacing, elegant typography, well-designed cards, consistent icons, restrained animations and hover effects, responsive navigation, and excellent mobile, tablet, and desktop layouts. Avoid generic Bootstrap templates, excessive gradients, clutter, oversized rounded cards everywhere, and unprofessional colour combinations.
- Use consistent, reusable design tokens/styles for colours, typography, spacing, buttons, cards and forms.
- Home page: system title and introduction; professional hero; brief explanation of available student services; clear calls to action; overview of services; explanation of how the request process works; navigation menu; professional footer.
- Services page: display at least six services stored in an array of JavaScript objects, each with ID, service name, description, processing time, and department; render dynamically in React with attractive cards, consistent icons, processing-time indicators, department information, and links to individual service details.
- Include exactly these requested services: Academic Transcript Request, Letter of Recommendation Request, Registration Assistance, Student ID Replacement, Technical Support, and General Enquiry.
- Service Details page: use a React Router parameter to identify and display the selected service; show name, full description, department, estimated processing time and relevant instructions; include a button to proceed to the request form; handle invalid service IDs.
- Provide a Requests Management page that retrieves, displays and manages requests from Firestore.
- Provide a professional Not Found/404 page with a button/link returning to the Home page.
- Evidence: the webpack production bundle rendered in desktop/mobile captures from the Node.js/Express server; direct React page URLs returned the SPA document; `/health` returned HTTP 200; and `/manus-routes.json` returned HTTP 200 as JSON with all six application routes.

## 2. React concepts, reusable components, and navigation — Complete
- Demonstrate functional components, JSX, props, component composition, useState, useEffect, event handling, conditional rendering, rendering arrays, form handling and validation.
- At least two reusable components must clearly receive information through props; examples may include ServiceCard, StatusBadge, PageHeader, Button, and FormField.
- Use React Router DOM routes for Home, Services, dynamic Service Details, Request submission, Request Confirmation, Requests management and 404.
- Use Link and NavLink for navigation; use a dynamic route parameter; implement nested routing where appropriate; use programmatic navigation with useNavigate after successful form submission; allow users to return to Home; and avoid unnecessary full-page browser refreshes.
- Keep components organised and straightforward to explain during a university assessment. Do not put the entire application inside App.jsx.
- Evidence: route/component implementation exists in the project source; all listed routes render in the development preview.

## 3. Validated request submission and confirmation — In progress; successful Firestore submission requires user Firebase configuration
- Request form fields: student name, student ID, email address, service required, description/reason for request, date of request, and submit button.
- Automatically preselect/populate the selected service when arriving from a Service Details page.
- Implement React form validation, not only HTML required attributes. Student name cannot be empty; Student ID cannot be empty; email must have a valid format; a service must be selected; request description cannot be empty. Display appropriate error messages beside relevant fields.
- On valid submission, save the request to Firestore with a unique document ID and initial status Pending. Display success and navigate only after a successful save. Do not show fake success when Firestore fails; provide useful submission errors. Clear the form only after a successful submission.
- Confirmation page: show a clear success message, submitted request details, request ID, submission date, navigation back to the Services page, and navigation to view Requests.
- Evidence: browser testing of an empty form showed field-level React validation for student name, student ID, email, service and description; service-detail query selected the matching service. The successful live Firestore save/confirmation path remains unverified because no Firebase project credentials were supplied.

## 4. Firestore request management and CRUD — In progress; backend verification requires user Firebase configuration
- Use Firebase Firestore and a collection named `studentRequests`.
- CREATE: validate submitted information; save the request to Firestore; generate a unique document ID; assign initial status Pending; display a successful submission message; clear the form after successful submission.
- READ: retrieve requests from Firestore and display them dynamically on the Requests page; handle loading, empty and database-error states.
- Display request ID, student name, student ID, email, requested service, submission date and status; include a view-details action, status-update action and delete action.
- UPDATE: allow status changes among Pending, In Progress, Completed and Rejected; save each updated status to Firestore and update the interface; handle update failures.
- DELETE: ask for confirmation before deleting; remove the request document from Firestore; update the interface; handle deletion failures.
- Demonstrate all four operations: CREATE → READ → UPDATE → DELETE. Keep database operations separate from UI components.
- The code, error/empty/loading states, staff access gate and restrictive rules are implemented, but live Firestore operations and staff sign-in have not been tested without a user-configured project.

## 5. Firebase configuration, security, and setup documentation — Complete (project connection intentionally left for the user)
- Firebase is not yet configured. Do not invent Firebase credentials or hardcode secrets; make Firebase connectable later.
- Provide `.env.example`, a reusable Firebase configuration module, and Firestore service functions; use environment variables for Firebase configuration.
- Provide appropriate Firestore security rules and do not leave the production database accessible to everyone.
- Create a detailed README.md with project introduction, features, technologies, project structure, Linux/VS Code installation instructions, dependency installation, how to run the app, Firebase project setup, environment variable configuration, Firestore database creation and connection, collection structure, and explanation of CRUD functionality.
- Clearly identify any Firebase tests or connection steps that remain dependent on user-supplied Firebase configuration.
- Evidence: `.env.example`, Firebase module, Firestore service, `firestore.rules`, `firebase.json` and README setup steps are present. Rules require approved staff for request reads/updates/deletes and restrict student creates to the expected schema and canonical service IDs/names. Credentials were not supplied.

## 6. Quality and delivery — Partial; live Firestore tests await configuration
- Application runs without compilation errors, has working navigation, functional forms, proper validation, all six services, responsive styling and consistent UI; demonstrates the required React concepts; and has working Firestore CRUD once configured.
- Handle failed Firestore submission, retrieval, update and deletion; empty request lists; loading states; field validation errors; and invalid routes.
- Install dependencies, run the application and production build, fix errors, test all routes and form validation, and test Firestore functionality when credentials are available.
- Deliver complete React source code, required components and pages, router configuration, Firebase integration, Firestore CRUD, responsive CSS, `.env.example`, Firestore security rules, README, and clear setup/execution instructions.
- Prioritise the university assignment over unnecessary features; keep the implementation organised and understandable for lecturer assessment.
- Evidence: production build succeeds; `npm audit` reports zero vulnerabilities; application and exact route manifest return HTTP 200 on configured port 3000; desktop/mobile screenshots and field-validation checks pass. Firebase connection, Firestore CRUD, and staff sign-in remain unverified until project settings are configured.
