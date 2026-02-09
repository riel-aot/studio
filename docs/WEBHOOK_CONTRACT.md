# Webhook Contract

This document defines the API contract for all communication between the ClassPulse frontend and the n8n backend. All communication happens over a single webhook endpoint, with the specific action determined by the event payload.

## Endpoint

- **Method**: `POST`
- **Path**: `/api/webhook` (This is the Next.js Gateway, which proxies to the n8n URL)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <ID_TOKEN>`

## Request Payload Structure

Every request sent to the webhook endpoint must follow this structure.

```typescript
interface WebhookRequest {
  eventName: string; // The name of the event to trigger
  requestId: string; // A unique UUID for this specific request
  timestamp: string; // ISO 8601 timestamp
  actor: {
    role: 'teacher' | 'parent' | 'admin';
    userId: string; // The user's unique ID from the JWT
  };
  payload: Record<string, any>; // The event-specific data
}
```

- **`eventName`**: A string from the list of defined events below.
- **`requestId`**: A client-generated UUID (v4) to trace a single request through the system.
- **`timestamp`**: The time the event was initiated on the client.
- **`actor`**: Information about the user performing the action, derived from the JWT on the client-side. The backend **MUST** re-validate this information from the token in the `Authorization` header.
- **`payload`**: An object containing data relevant to the specific `eventName`.

## Response Payload Structure

Every response from the webhook should follow this structure.

```typescript
interface WebhookResponse {
  success: boolean; // True if the operation succeeded, false otherwise
  data?: any; // The data to return on success. Structure depends on the event.
  error?: {
    message: string; // A user-friendly error message
    code?: string; // An optional error code (e.g., 'DB_ERROR', 'UNAUTHORIZED')
  };
  correlationId: string; // A unique ID from the n8n workflow execution for debugging
}
```

- **`success`**: The primary indicator of the outcome.
- **`data`**: Present only if `success` is `true`.
- **`error`**: Present only if `success` is `false`.
- **`correlationId`**: The unique execution ID from the n8n workflow. The frontend should log this ID (in dev mode) when an error occurs to help cross-reference with backend logs.

---

## Event List & Payloads (MVP)

This is the minimum set of events required for the application's core functionality.

| `eventName`                 | Actor Roles      | `payload` Schema                                              | `data` Schema (on success)                                   |
| --------------------------- | ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `GET_DASHBOARD_SUMMARY`     | `teacher`        | `{}`                                                          | `{ kpis: {...}, reviewQueue: [...] }`                        |
| `GET_REVIEW_QUEUE`          | `teacher`        | `{ page?: number, limit?: number }`                           | `{ items: [...], total: number }`                            |
| `NEW_ASSESSMENT_START`      | `teacher`        | `{}`                                                          | `{ prefillData: {...} }`                                     |
| `ASSESSMENT_CREATE_DRAFT`   | `teacher`        | `{ title: string, studentId: string, rubricId?: string }`     | `{ assessmentId: string }`                                   |
| `ASSESSMENT_GET`            | `teacher`, `parent` | `{ assessmentId: string }`                                    | `Full Assessment Object`                                     |
| `ASSESSMENT_FINALIZE`       | `teacher`        | `{ assessmentId: string }`                                    | `{ success: true }`                                          |
| `STUDENT_LIST`              | `teacher`        | `{ page?: number, limit?: number, sortBy?: string }`          | `{ students: [...], total: number }`                         |
| `STUDENT_GET`               | `teacher`        | `{ studentId: string }`                                       | `Full Student Object with recent assessments`                |
| `REPORT_GET`                | `teacher`, `parent` | `{ reportId: string }`                                        | `Full Report Object`                                         |
| `HEALTH_CHECK`              | `teacher`, `admin` | `{}`                                                          | `{ authConfigured: bool, webhookConfigured: bool, ... }`     |

This contract is the source of truth for frontend-backend communication. Any changes must be agreed upon by both the frontend and backend teams.
