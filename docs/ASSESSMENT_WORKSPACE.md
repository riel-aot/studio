# Assessment Workspace Documentation

This document outlines the architecture and user flow of the Teacher Assessment Workspace, the primary interface for grading and providing feedback on student work in ClassPulse.

## 1. Philosophy: Teacher as the Final Approver

The core principle of this workspace is that **AI is an assistant, not a replacement.**
- **AI Generates Drafts**: All outputs from AI—be it rubric scores, textual suggestions, or identified issues—are treated as drafts. They are never shown to students or parents directly.
- **Teacher Approves**: The teacher has the final say. They must review, edit, and explicitly "Finalize" an assessment. This action locks in the AI's suggestions and the teacher's own feedback as the official record.
- **Manual Override**: The system is designed to be fully functional even if the AI fails or the teacher chooses not to use it. A teacher can always ignore the AI and enter their feedback manually.

## 2. Workspace Flow

The workspace is designed to handle two types of student work: typed text and handwritten images/PDFs.

### Typed Work Flow
1.  **Input**: The teacher uploads a file (e.g., `.docx`, `.pdf`) or pastes text directly into a textarea.
2.  **Save**: The teacher saves the text, which becomes the canonical input for this assessment.
3.  **AI Review**: The teacher clicks "Run AI Review". This sends the saved text to the backend via the `ASSESSMENT_RUN_AI_REVIEW` webhook.
4.  **Review & Edit**: The UI updates with AI-generated suggestions and a draft rubric. The teacher reviews these suggestions, applying, dismissing, or editing them. They also add their own qualitative feedback.
5.  **Finalize**: The teacher clicks "Finalize", which triggers the `ASSESSMENT_FINALIZE` webhook, locking the assessment and making it ready for reporting.

### Handwritten Work Flow
1.  **Input**: The teacher uploads an image or PDF of the handwritten work.
2.  **OCR**: The teacher clicks "Extract Text". This sends the file to the backend for Optical Character Recognition (OCR) via the `ASSESSMENT_EXTRACT_TEXT` webhook.
3.  **Edit OCR**: The extracted text appears in an editor. The teacher **must** review and correct any errors in the OCR output.
4.  **Save**: The teacher saves the corrected text. This text now becomes the canonical input.
5.  **AI Review -> Finalize**: From this point, the flow is identical to the Typed Work flow.

## 3. Frontend vs. n8n Backend Responsibilities

### Frontend
- Renders the 3-panel workspace UI.
- Manages local UI state (loading spinners, button disabled states, modal visibility).
- Handles file uploads and user input validation (e.g., empty text).
- Makes specific, event-driven webhook calls to n8n for all backend operations.
- Displays the data returned from n8n (e.g., AI suggestions, rubric drafts).
- **Does NOT contain any business logic.** It doesn't know how to perform OCR or score a rubric. It only knows which webhook to call.

### n8n Backend
- Listens for all `ASSESSMENT_*` webhook events.
- Contains all business logic.
- **`ASSESSMENT_EXTRACT_TEXT`**: Receives a file reference and uses an OCR service to extract text, returning it to the frontend.
- **`ASSESSMENT_RUN_AI_REVIEW`**: Receives the assessment text and orchestrates calls to a generative AI model. It passes the text along with the rubric structure and asks the AI to:
    - Identify issues (grammar, clarity, etc.).
    - Find evidence in the text that aligns with rubric criteria.
    - Propose a draft score for each criterion.
- Stores all data in the database (e.g., saving AI suggestions, teacher feedback).
- **`ASSESSMENT_FINALIZE`**: Performs the final state change in the database, marking the assessment as complete.

## 4. Webhook Events & Payloads

- **`ASSESSMENT_GET`**:
  - **Payload**: `{ assessmentId: string }`
  - **Returns**: The complete state of the assessment workspace.
- **`ASSESSMENT_TEXT_SAVE`**:
  - **Payload**: `{ assessmentId: string, text: string }`
  - **Returns**: `{ success: true }`
- **`ASSESSMENT_EXTRACT_TEXT`**:
  - **Payload**: `{ assessmentId: string, fileRef: string }`
  - **Returns**: `{ extractedText: string }`
- **`ASSESSMENT_RUN_AI_REVIEW`**:
  - **Payload**: `{ assessmentId: string }`
  - **Returns**: The updated assessment state with `aiReview.status = 'ready'` and populated suggestions/rubric.
- **`ASSESSMENT_APPLY_SUGGESTION`**:
  - **Payload**: `{ assessmentId: string, suggestionId: string, action: 'apply' | 'dismiss' }`
  - **Returns**: The updated text after applying the suggestion.
- **`ASSESSMENT_SAVE_TEACHER_FEEDBACK`**:
  - **Payload**: `{ assessmentId: string, teacherNotes: string, finalFeedback: string }`
  - **Returns**: `{ success: true }`
- **`ASSESSMENT_FINALIZE`**:
  - **Payload**: `{ assessmentId: string }`
  - **Returns**: The final, locked-down assessment state.
