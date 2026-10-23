# Security Architecture & Policies

## 1. Threat Model & Philosophy
**SQUID PROTOCOL — SURVIVE THE SYSTEM** is built under the assumption that participants are technical college students capable of inspecting browser traffic, craft custom HTTP requests, and probing for race conditions. 

Therefore, **the client is never trusted**:
- All scores, stage progression, timers, and signals are computed and validated exclusively on the server.
- Secret answer keys, expected Sudoku grids, logic challenge answers, and debugging keys are never sent to participants.
- The public landing page and navigation contain zero admin links or exposed endpoints.

---

## 2. Authentication & Authorization
- **Password & PIN Hashing**: All team PINs and administrator credentials are encrypted using **bcrypt** with salted adaptive cost factors. Plaintext credentials are never persisted.
- **Session Tokens**: Authenticated sessions utilize signed JWT tokens delivered primarily via `HttpOnly`, `SameSite=Lax/None`, `Secure` cookies, preventing cross-site scripting (XSS) extraction.
- **Role-Based Access Control (RBAC)**:
  - `TEAM`: Can only submit for their own squad and access active round data.
  - `ADMIN`: Full administrative control over timers, signals, questions, scores, and audits.
- **Resource Ownership**: Team-specific endpoints verify that `req.user.teamId` matches the requested team resource.

---

## 3. Scoring Integrity & Idempotency
- **Unique Constraint Ledger**: Every score event is recorded in PostgreSQL with a composite unique constraint `@@unique([teamId, source])`.
  - Duplicate submissions for the same challenge fail at the database level and will not award points twice.
  - Network retries and parallel requests are completely idempotent.
- **Atomic Transactions**: All score updates and stage advancements execute inside `prisma.$transaction`.
- **Manual Adjustments**: All organizer score overrides require a mandatory written justification (minimum 5 characters) and are permanently logged in `AdminAuditLog`.

---

## 4. Rate Limiting & Denial of Service Protection
- **Authentication Rate Limiting**: Max 15 attempts per minute per IP address (`authRateLimiter`).
- **Submission Rate Limiting**: Max 60 submissions per minute per IP address (`submissionRateLimiter`).
- **Payload Limits**: JSON body parser strictly capped at 1MB.

---

## 5. Safe Test Database Reset Guardrails
Destructive cleanup commands (`resetTestDatabase`) have 4 fail-closed safety mechanisms:
1. **Production Abort**: Throws immediate error if `NODE_ENV === 'production'`.
2. **Explicit Flag**: Requires `TEST_RESET_ENABLED === 'true'`.
3. **Database Identity**: URL must explicitly contain the substring `test`.
4. **Target Isolation**: Cleans test run submissions only while preserving schemas.

---

## 6. Reporting Security Vulnerabilities
If you discover a security vulnerability, please email `security@squidprotocol.event` or notify the event lead organizers directly. Do not create public GitHub issues for sensitive disclosures.
