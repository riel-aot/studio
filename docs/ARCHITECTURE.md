# ClassPulse Architecture

This document outlines the architecture of the ClassPulse application, detailing the responsibilities of each component.

## System Diagram (Text-Based)

```
+----------------+      +---------------------+      +-----------------+      +---------------------+
|                |      |                     |      |                 |      |                     |
|  End User      |----->|   ClassPulse UI     |----->|  Webhook Gateway  |----->|   n8n Workflows     |
| (Teacher/Parent|      |    (Next.js)        |      | (Next.js API)   |      |  (Business Logic)   |
|                |      |                     |      |                 |      |                     |
+----------------+      +---------------------+      +-----------------+      +----------+----------+
                                                                                         |
                                                                                         |
                                    +---------------------------v------------------------+
                                    |                           |
                            +-------+--------+          +-------+--------+
                            |                |          |                |
                            |   Database     |          |  External APIs |
                            | (e.g., Postgres|          |  (e.g., AI)    |
                            |                |          |                |
                            +----------------+          +----------------+
```

## Component Responsibilities

### 1. ClassPulse UI (Frontend)

- **Framework**: Next.js (App Router) with React and TypeScript.
- **Responsibility**: User interface and user experience.
- **Key Functions**:
  - Renders all pages, components, and visual elements.
  - Manages local UI state (loading, errors, form inputs).
  - Authenticates users via Microsoft Entra ID (OIDC flow).
  - Collects user input through forms (using React Hook Form and Zod for validation).
  - **Does NOT contain any business logic.**
  - **Does NOT directly access the database or any external services (like AI).**
  - Its ONLY communication with the backend is through the Webhook Gateway.

### 2. Webhook Gateway (Next.js API Route)

- **Location**: `src/app/api/webhook/route.ts`
- **Responsibility**: A secure proxy between the frontend and the n8n backend.
- **Key Functions**:
  - Provides a single, consistent endpoint for the frontend to call (`/api/webhook`).
  - Receives event-based requests from the frontend.
  - Retrieves the user's ID token from the session/context.
  - Attaches the token to the `Authorization: Bearer <token>` header.
  - Forwards the request to the actual n8n webhook URL (configured via `N8N_WEBHOOK_URL` environment variable).
  - Masks the n8n URL from the client-side browser.
  - Passes the response from n8n back to the frontend.

### 3. n8n Workflows (Backend Brain)

- **Framework**: n8n (self-hosted or cloud).
- **Responsibility**: All business logic, data processing, and orchestration.
- **Key Functions**:
  - Triggered by webhooks from the Gateway.
  - **Validates the JWT** attached to the request to ensure the user is authenticated and has the correct role for the requested action.
  - Executes business logic based on the `eventName` in the webhook payload.
  - Connects to the database (e.g., Supabase Postgres) to read or write data.
  - Calls external services (e.g., AI models for assessment analysis) if required.
  - Constructs a standardized success or error response.
  - Returns the response to the Webhook Gateway, which then forwards it to the UI.

### 4. Database

- **Technology**: Any SQL database, with Supabase Postgres being a likely choice.
- **Responsibility**: Data persistence.
- **Key Functions**:
  - Stores all application data: users, students, assessments, rubrics, reports, etc.
  - **Is ONLY accessed by n8n workflows.** The frontend is completely decoupled from the database schema and technology.

## Data and Control Flow (Example: Creating an Assessment)

1.  **Teacher** fills out the "New Assessment" form in the **ClassPulse UI**.
2.  On submit, the UI calls its internal webhook client with the event `ASSESSMENT_CREATE_DRAFT` and the form data as the payload.
3.  The webhook client sends a `POST` request to the **Webhook Gateway** (`/api/webhook`).
4.  The **Gateway** adds the teacher's `Authorization: Bearer <token>` header and forwards the request to the **n8n** instance.
5.  The corresponding **n8n workflow** is triggered.
6.  The workflow first validates the JWT.
7.  It then runs the business logic: validates the payload, creates a new draft assessment record in the **Database**.
8.  **n8n** sends a `{ success: true, data: { assessmentId: '...' } }` response back.
9.  The **Gateway** passes this response to the **UI**.
10. The **UI** receives the success response and redirects the teacher to the new assessment's page (`/teacher/assessments/[assessmentId]`).
