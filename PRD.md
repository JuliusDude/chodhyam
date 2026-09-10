# Chodhyam — Product Requirements Document (PRD)

**Status:** Draft v0.1  
**Product:** Chodhyam  
**Document Type:** Product Requirements Document  
**Primary Goal:** Define a cloud-provider-agnostic, multi-user PDF question-answering web application using Retrieval-Augmented Generation (RAG) and an open-source Small Language Model (SLM).

---

## 1. Product Overview

### 1.1 Product Summary

**Chodhyam** is a temporary AI workspace for understanding documents. A user logs in, uploads one or more PDF files, and asks natural-language questions about the uploaded document collection. The system uses a RAG pipeline to retrieve relevant content and an open-source SLM hosted in a cloud GPU environment to generate grounded answers.

The user's document collection is **ephemeral**. When the session ends or expires, the system must remove the user's uploaded PDFs and associated derived data such as extracted text, chunks, embeddings, and temporary vector-store data.

### 1.2 Product Positioning

Chodhyam should not be positioned merely as a “chat with PDF” application. It is a **temporary, privacy-aware document intelligence workspace** that:

- Accepts multiple PDFs per user session.
- Answers questions across the user's temporary document collection.
- Grounds responses in retrieved document content.
- Supports multiple concurrent users.
- Separates each user's document context.
- Avoids permanent retention of user documents.
- Uses open-source AI components wherever practical.
- Can be deployed on OCI, Azure, or another compatible cloud provider without changing the core application logic.

---

# 2. Problem Statement

Users often need to extract specific information from multiple PDF documents without manually reading and searching every page. Conventional document search is slow for natural-language questions, while generic AI chat systems may answer without sufficient grounding in the source documents.

Chodhyam addresses this by combining temporary document storage, document chunking, vector retrieval, and an open-source SLM. The system should return answers based primarily on information retrieved from the user's uploaded documents.

---

# 3. Goals

## 3.1 Primary Goals

1. Allow a user to create an authenticated session.
2. Allow a user to upload multiple PDF files into one temporary document collection.
3. Process uploaded PDFs into searchable chunks and embeddings.
4. Retrieve relevant document content for each user question.
5. Send the retrieved context and user question to an open-source SLM inference service.
6. Return a useful, grounded answer to the user.
7. Support approximately **3–5 concurrent users** for the initial project deployment.
8. Isolate document collections between users/sessions.
9. Delete user documents and derived document data after session termination or expiry.
10. Keep the core system portable across OCI, Azure, and other cloud infrastructure providers.
11. Favor free-tier, open-source, or otherwise zero-cost components for the academic project.

## 3.2 Secondary Goals

- Show clear cloud-computing concepts such as distributed services, remote inference, object storage, networking, and resource lifecycle management.
- Keep the SLM infrastructure independent from the main application backend.
- Make it possible to replace the GPU inference provider without rewriting the application.
- Provide source/page references for answers where the PDF extraction pipeline supports reliable page attribution.

---

# 4. Non-Goals

The following are outside the initial scope:

- Permanent document libraries.
- Long-term document history.
- Enterprise-scale deployment.
- Fine-tuning or training an SLM.
- Building a custom foundation model.
- Supporting arbitrary file types beyond PDF in the first release.
- Guaranteeing production-grade availability comparable to commercial AI platforms.
- Supporting more than 5 concurrent users as a formal initial requirement.
- Using paid proprietary AI APIs as a core dependency.

---

# 5. Target Users

## 5.1 Primary User

A student, researcher, or general user who needs to understand one or more PDF documents quickly through natural-language questions.

## 5.2 Initial Concurrency

The system should be designed and tested for **3–5 concurrent active users**. The architecture should not assume a single-user flow.

---

# 6. Core User Journey

```text
Landing Page
    ↓
Login / Registration
    ↓
Authenticated Session
    ↓
Upload one or more PDFs
    ↓
Document processing
    ↓
Temporary document collection ready
    ↓
User asks a question
    ↓
Retrieve relevant chunks
    ↓
Send context + question to SLM
    ↓
Return grounded answer
    ↓
User asks more questions / uploads more PDFs
    ↓
Logout or session expiration
    ↓
Delete PDFs + extracted text + chunks + embeddings + vector data
    ↓
Session fully cleaned
```

---

# 7. Functional Requirements

## FR-01 — Authentication

The system shall provide user authentication before document access.

### Minimum requirements

- User can log in.
- Each authenticated user receives a secure application session.
- An unauthenticated user cannot access another user's documents or chat context.
- Session identifiers must not be guessable.
- Authentication implementation should be replaceable without coupling it to a specific cloud provider.

### Initial implementation direction

A simple application-level authentication system is preferred for the first project release unless institutional requirements dictate otherwise.

---

## FR-02 — Document Upload

The user shall be able to upload one or more PDF files.

### Requirements

- Multiple PDFs can belong to the same active session.
- Upload progress/status should be visible.
- The system should reject unsupported file formats.
- File-size limits should be configurable.
- Uploaded files must be associated with the authenticated user's active session.
- The system should prevent a user from referencing another user's files by manipulating IDs or request parameters.

### Recommended internal model

```text
User
 └── Active Session
      └── Temporary Document Collection
           ├── document-1.pdf
           ├── document-2.pdf
           └── document-3.pdf
```

---

## FR-03 — PDF Processing

After upload, the backend shall process each PDF into RAG-ready data.

### Pipeline

```text
PDF
 ↓
Text extraction
 ↓
Cleaning / normalization
 ↓
Chunking
 ↓
Embedding generation
 ↓
Vector storage
 ↓
Document ready
```

### Requirements

- Text-based PDFs are required for the initial release.
- Scanned/image PDFs may be treated as future scope unless OCR is added later.
- Processing status shall be tracked.
- Failed documents shall produce an actionable status rather than silently appearing ready.
- Processing must preserve enough metadata to identify the originating document and page where feasible.

---

## FR-04 — Temporary Document Collection

A session shall have a logical collection of documents and derived RAG data.

The collection must be isolated from all other user sessions.

### Collection contents may include

- Original PDF object/file.
- Extracted text.
- Chunks.
- Chunk metadata.
- Embeddings.
- Temporary vector-store records.
- Session/document metadata.

The collection must be treated as **ephemeral data**.

---

## FR-05 — Question Answering

The user shall be able to ask natural-language questions about the active document collection.

### RAG flow

```text
User Question
     ↓
Question embedding
     ↓
Vector similarity search
     ↓
Top relevant chunks
     ↓
Context construction
     ↓
SLM inference
     ↓
Answer
```

### Requirements

- Retrieval must be scoped to the current user's active session/document collection.
- The SLM should receive the user question plus retrieved source context.
- The system should instruct the SLM to avoid inventing unsupported information.
- When sufficient information is unavailable, the answer should clearly indicate that the documents do not provide enough information.
- The system should avoid sending the entire PDF collection to the SLM for every question.

---

## FR-06 — Source Attribution

Where page-level metadata is available, the system should show which document and page(s) contributed to the answer.

Example:

```text
Answer: ...

Sources:
- research-paper.pdf — Page 12
- research-paper.pdf — Page 14
```

Source attribution is a usability feature and must not be represented as proof that the SLM is factually correct.

---

## FR-07 — Multi-User Isolation

The application shall support multiple users simultaneously.

### Requirements

- User A must never retrieve User B's documents.
- User A must never retrieve User B's vector records.
- User A must never receive User B's extracted text or metadata.
- Session/document ownership must be enforced server-side.
- Client-provided document/session IDs must always be validated against authenticated ownership.

### Example

```text
User A
 └── Session A
      ├── A1.pdf
      ├── A2.pdf
      └── Chroma collection A

User B
 └── Session B
      ├── B1.pdf
      └── Chroma collection B
```

---

## FR-08 — Session Termination and Cleanup

The system shall delete temporary document data when the session ends.

### Cleanup triggers

At minimum:

1. Explicit logout.
2. Server-side session expiry after a configurable inactivity period.

### Cleanup scope

Cleanup must remove **all document-derived data**, not only the original PDF.

```text
Delete:
- PDFs
- extracted text
- chunks
- embeddings
- Chroma/vector records
- temporary metadata associated solely with the document collection
```

### Important constraint

Browser tab closure must not be the sole cleanup mechanism. Server-side expiration is required because browser-close events are not guaranteed.

### Cleanup behavior

Cleanup should be idempotent. Running cleanup more than once must not corrupt unrelated user/session data.

---

## FR-09 — SLM Inference Service

The SLM shall be an open-source model hosted independently from the main web application/backend where practical.

### Requirements

- Model must be suitable for RAG-based question answering.
- Model must be deployable in a cloud GPU environment available to the project.
- The inference layer must expose a stable HTTP/HTTPS API.
- The backend must not be tightly coupled to the underlying model provider.
- Model and inference configuration must be externalized.

### Abstraction

The backend should communicate through an inference interface such as:

```http
POST /generate
Content-Type: application/json

{
  "question": "...",
  "context": "...",
  "session_id": "..."
}
```

Response example:

```json
{
  "answer": "...",
  "model": "...",
  "latency_ms": 2500
}
```

The exact API contract may be refined during technical design.

---

## FR-10 — Provider-Agnostic Cloud Deployment

The application shall not require OCI-specific or Azure-specific code in its core domain logic.

### Architecture principle

Cloud providers are implementation targets, not product dependencies.

### Example deployment mapping

| Capability | Provider A | Provider B | Application dependency |
|---|---|---|---|
| Web frontend | Vercel | Vercel | HTTP client only |
| Backend compute | OCI VM | Azure VM | Container/process runtime |
| Object storage | OCI Object Storage | Azure Blob Storage | Storage adapter |
| Vector DB | Chroma | Chroma | Chroma API |
| SLM inference | GPU provider A | GPU provider B | Inference API |

### Required design approach

Provider-specific functionality should be hidden behind interfaces/adapters/configuration where practical.

Examples:

```text
StorageService
  ├── OCIStorageAdapter
  └── AzureBlobStorageAdapter

Compute/deployment
  ├── OCI deployment configuration
  └── Azure deployment configuration

InferenceService
  ├── ProviderAInferenceAdapter
  └── ProviderBInferenceAdapter
```

The exact adapter boundaries should be decided during technical architecture.

---

# 8. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │       Vercel         │
                         │   Next.js Frontend   │
                         │                      │
                         │ Login                │
                         │ Upload PDFs          │
                         │ Document status      │
                         │ Chat                 │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │  Cloud Backend       │
                         │  OCI / Azure / etc.  │
                         │                      │
                         │ FastAPI              │
                         │ Auth / Sessions      │
                         │ Upload orchestration │
                         │ PDF processing       │
                         │ RAG orchestration    │
                         │ Cleanup jobs         │
                         └──────┬───────┬───────┘
                                │       │
                    ┌───────────┘       └────────────────┐
                    ▼                                    ▼
          ┌──────────────────┐                 ┌──────────────────┐
          │ Object Storage  │                 │ Chroma           │
          │ Temporary PDFs  │                 │ Vector Store     │
          │ OCI/Azure/etc.  │                 │ Session-scoped   │
          └──────────────────┘                 └────────┬─────────┘
                                                        │
                                                Relevant context
                                                        │
                                                        ▼
                                            ┌────────────────────┐
                                            │ GPU Inference      │
                                            │ Cloud Provider     │
                                            │                    │
                                            │ Open-source SLM    │
                                            └─────────┬──────────┘
                                                      │
                                                      ▼
                                                   Answer
                                                      │
                                                      ▼
                                                  Backend
                                                      │
                                                      ▼
                                                   Vercel
```

---

# 9. Proposed Technology Direction

These are **initial technology preferences**, not irreversible requirements.

| Layer | Preferred direction | Reason |
|---|---|---|
| Frontend | Next.js / TypeScript | Strong web-app ecosystem and easy Vercel deployment |
| Frontend hosting | Vercel | Suitable for the web UI |
| Backend | Python + FastAPI | Good fit for PDF/RAG/ML ecosystem |
| Backend hosting | OCI or Azure VM | Provider portability |
| PDF processing | Open-source Python PDF tooling | Avoid paid APIs |
| Embeddings | Open-source embedding model | Avoid proprietary embedding APIs |
| Vector DB | **Chroma** | Lightweight and sufficient for project scale |
| SLM | Open-source SLM | Control and zero-cost inference target |
| SLM runtime | To be selected after GPU evaluation | Depends on available free GPU resources |
| Storage | Object-storage abstraction | Portable across cloud providers |
| Packaging | Docker | Portable deployments |
| Protocol | HTTPS/REST | Simple service integration |

---

# 10. Cloud Provider Abstraction

## 10.1 Provider-neutral interfaces

The backend should define logical services such as:

```text
IStorageService
IInferenceService
ISessionService
IDocumentService
IVectorStoreService
```

Only infrastructure integration code should contain provider-specific configuration.

## 10.2 Configuration

Provider selection should be controlled by environment variables/configuration rather than source-code changes wherever possible.

Example concept:

```env
CLOUD_PROVIDER=oci
STORAGE_PROVIDER=oci
INFERENCE_PROVIDER=provider_a
VECTOR_STORE=chroma
```

An alternative deployment could use:

```env
CLOUD_PROVIDER=azure
STORAGE_PROVIDER=azure_blob
INFERENCE_PROVIDER=provider_b
VECTOR_STORE=chroma
```

Exact configuration names are implementation details and may change.

---

# 11. RAG Requirements

## 11.1 Chunking

The system shall split extracted PDF text into retrieval-friendly chunks.

Chunk size and overlap should be configurable rather than hard-coded into business logic.

## 11.2 Embeddings

The system shall generate vector embeddings using an open-source embedding model compatible with the chosen runtime.

## 11.3 Retrieval

The system shall:

- Search only within the active user's collection.
- Retrieve the most relevant chunks for the question.
- Include document/page metadata where available.
- Allow retrieval parameters such as top-k to be tuned.

## 11.4 Context Construction

The backend shall construct an inference prompt containing:

- System instructions.
- Retrieved document context.
- User question.

Prompt templates should be version-controlled and configurable.

---

# 12. SLM Requirements and Selection Criteria

The final SLM is intentionally **not fixed in this PRD**.

The selected model must be evaluated against:

1. Open-source licensing suitable for the project.
2. Memory requirements.
3. GPU compatibility.
4. Inference latency.
5. RAG question-answering quality.
6. Context-window size.
7. Quantization/runtime support.
8. API-serving compatibility.
9. Expected cost under the project’s free-resource constraint.
10. Ability to support the project’s target demonstration load.

### Important architectural rule

The SLM may change without changing:

- Frontend behavior.
- Authentication design.
- Chroma schema/ownership model.
- Core RAG orchestration.
- Cloud-provider abstraction.

Only the inference adapter/configuration should require changes.

---

# 13. User Experience Requirements

## 13.1 Landing Page

The landing page should quickly communicate:

- What Chodhyam is.
- Upload multiple PDFs.
- Ask natural-language questions.
- Answers are grounded in uploaded documents.
- Documents are temporary and removed after the session.

The initial messaging should emphasize **temporary document intelligence**, rather than generic chatbot functionality.

## 13.2 Authenticated Workspace

The workspace should support:

- Current user/session indicator.
- PDF upload.
- List of uploaded documents.
- Processing status.
- Chat/question input.
- Answer display.
- Source references when available.
- Logout.

## 13.3 Error States

The application should clearly communicate errors such as:

- Invalid file type.
- File too large.
- PDF extraction failure.
- Document processing failure.
- No relevant context found.
- SLM inference unavailable.
- Session expired.
- Unauthorized document access attempt.

---

# 14. API-Level Requirements

The exact API may evolve, but the backend should provide logical endpoints similar to:

```text
POST   /auth/login
POST   /auth/logout
GET    /session
POST   /documents
GET    /documents
GET    /documents/{id}
DELETE /documents/{id}
POST   /chat/query
POST   /session/cleanup
```

Authentication method, token format, and endpoint naming are implementation details.

---

# 15. Security Requirements

## 15.1 Authentication and Authorization

- Protected APIs require authentication.
- Every document operation must validate ownership.
- Server-side authorization is mandatory.

## 15.2 Data Isolation

- Session identifiers must not provide implicit authorization.
- Vector-store queries must include a session/user scope.
- Storage object paths/keys must not be trusted from the client.

## 15.3 Transport Security

- Public application traffic shall use HTTPS.
- Backend-to-inference traffic should use HTTPS where supported.

## 15.4 Secrets

API keys, credentials, tokens, and storage secrets shall be stored as environment/configuration secrets and must never be committed to source control.

## 15.5 Temporary Data

The system shall minimize persistence of user documents and must remove document data when the session ends/expired according to the cleanup policy.

---

# 16. Non-Functional Requirements

## NFR-01 — Portability

The core application shall be deployable on OCI or Azure without changing product behavior.

## NFR-02 — Cost

The initial implementation should target **zero direct service cost**, using free tiers and open-source software where available. Any free-tier limitations must be documented rather than assumed away.

## NFR-03 — Concurrency

The system should support 3–5 concurrent users for the initial project demonstration.

## NFR-04 — Reliability

A failure in SLM inference should produce a clear user-facing error and should not corrupt the user's session or document collection.

## NFR-05 — Observability

The backend should record enough non-sensitive operational information to diagnose:

- Authentication failures.
- Document processing failures.
- RAG latency.
- SLM latency.
- Cleanup execution/failure.

User document contents should not be logged by default.

## NFR-06 — Maintainability

Application logic, provider integrations, and infrastructure configuration should be separated.

## NFR-07 — Scalability Direction

Although the initial target is only 3–5 concurrent users, the architecture should avoid hard-coded single-user assumptions and should allow future separation of services if usage grows.

---

# 17. Data Model (Conceptual)

```text
User
- id
- username/email
- password_hash or external_auth_id
- created_at

Session
- id
- user_id
- created_at
- last_activity_at
- expires_at
- status

Document
- id
- session_id
- original_filename
- storage_key
- processing_status
- created_at
- page_count (optional)

Chunk
- id
- document_id
- session_id
- page_number (optional)
- text
- metadata

Vector Record
- vector_id
- session_id
- document_id
- chunk_id
- embedding
- metadata
```

Sensitive credential details and exact database schema remain implementation-specific.

---

# 18. Data Lifecycle

```text
UPLOAD
  ↓
Temporary object stored
  ↓
PDF processed
  ↓
Chunks + embeddings created
  ↓
Vector records stored
  ↓
User asks questions
  ↓
Session remains active
  ↓
Logout OR expiration
  ↓
Cleanup job
  ├── Delete vector records
  ├── Delete chunks/extracted text
  ├── Delete PDFs
  └── Delete temporary session metadata
  ↓
Session closed
```

### Cleanup order

The exact order may be optimized, but cleanup must ensure that no orphaned document-derived data remains unintentionally.

### Failure handling

If part of cleanup fails, the system should record the failure and retry safely. Cleanup operations should be idempotent.

---

# 19. Deployment Model

## 19.1 Preferred Initial Deployment

```text
Frontend
└── Vercel
    └── Next.js

Backend/Data Plane
└── OCI or Azure
    └── Dockerized FastAPI application
        ├── Auth/session logic
        ├── PDF processing
        ├── Embeddings
        ├── RAG orchestration
        ├── Chroma
        └── Cleanup worker/job

Inference Plane
└── Independent cloud GPU provider
    └── Open-source SLM inference service
```

## 19.2 Docker Requirement

The backend and supporting services should be containerized where practical to simplify migration between OCI and Azure.

---

# 20. Acceptance Criteria

A release candidate is acceptable when the following can be demonstrated:

### Authentication

- A user can log in.
- An unauthenticated user cannot access protected resources.

### Documents

- A user can upload at least two PDFs in one session.
- The system processes the PDFs successfully.
- The documents appear as one temporary collection.

### RAG

- A question can retrieve relevant content across multiple uploaded PDFs.
- The final answer is generated from the retrieved context.
- The application can show source/page references when metadata is available.

### Multi-user isolation

- Two test users can have separate document collections.
- User A cannot retrieve or view User B’s document information.

### Cleanup

- Logout triggers document cleanup.
- Session expiration triggers document cleanup.
- Original files and derived vector/document data are removed.
- Cleanup can be safely retried.

### Cloud portability

- The same core application can be deployed against OCI or Azure by changing deployment configuration/infrastructure adapters rather than rewriting the product logic.

### SLM

- The application can call the selected open-source SLM through a documented inference API.
- The SLM provider can be replaced through configuration/adapter changes.

### Concurrency

- A controlled test demonstrates 3–5 concurrent active users without cross-user data leakage.

---

# 21. Out-of-Scope / Future Enhancements

Potential later improvements include:

- OCR for scanned PDFs.
- More file formats such as DOCX, TXT, and HTML.
- Conversation history within a session.
- Streaming token responses.
- Better citation rendering and highlighted source passages.
- Hybrid search (keyword + vector).
- Reranking models.
- Background queue for document processing.
- Rate limiting.
- Advanced analytics/observability.
- Pluggable authentication providers.
- Multiple inference providers with automatic fallback.
- Larger-scale deployment.

---

# 22. Key Architectural Decisions

1. **Frontend is hosted separately from the backend.** The initial frontend target is Vercel.
2. **Backend is hosted in a portable cloud environment.** OCI and Azure are both valid deployment targets.
3. **Cloud-provider-specific services are accessed through abstraction/configuration where practical.**
4. **Chroma is the initial vector database.**
5. **The SLM is open source and independently hosted on a GPU-capable cloud service.**
6. **The backend communicates with the SLM through an inference API.**
7. **A user's PDFs form a temporary session-scoped document collection.**
8. **Original PDFs and derived RAG data are ephemeral.**
9. **3–5 concurrent users is the initial demonstration target.**
10. **The initial solution should avoid paid proprietary AI APIs and favor free/open-source infrastructure.**

---

# 23. Open Decisions / Risks

These items should be resolved during technical design rather than hard-coded into the PRD:

| Topic | Decision Needed |
|---|---|
| Cloud provider | OCI vs Azure based on access, free-tier limits, and regional availability |
| SLM | Final model selection |
| GPU provider | Free/low-cost provider capable of the required demonstration workload |
| SLM runtime | Runtime/server to expose the inference API |
| Embedding model | Final model selection |
| Chunking strategy | Chunk size, overlap, and metadata strategy |
| Auth | Custom auth vs managed provider |
| Session timeout | Exact inactivity duration |
| File limits | Maximum file size and number of PDFs |
| Storage | Exact object-storage implementation |
| Cleanup scheduler | Background worker, cron, or scheduled service |
| Deployment | Single VM/container stack vs separated services |
| Monitoring | Minimum logs/metrics needed for the project demo |

---

# 24. Definition of Done — MVP

The Chodhyam MVP is complete when:

- The user can log in.
- The user can upload multiple PDFs.
- Uploaded PDFs are processed into embeddings.
- Chroma stores vectors for the active session.
- The user can ask questions across the temporary collection.
- RAG retrieves relevant context.
- An open-source SLM generates the response.
- The frontend is hosted through Vercel.
- The backend/data plane can be deployed to OCI or Azure.
- At least 3–5 concurrent users can be demonstrated.
- User/session isolation is verified.
- Logout and session expiration remove the full document-derived dataset.
- No core feature depends irreversibly on OCI, Azure, or one specific SLM provider.

---

# 25. Product Principle

> **Chodhyam should be designed around capabilities, not cloud vendors.**
>
> OCI and Azure are deployment choices. Chroma, the RAG pipeline, the application interfaces, and the user experience should remain consistent regardless of which compatible cloud provider is selected.
