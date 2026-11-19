# Security Coding Skill

## 1. Purpose

This skill establishes mandatory secure coding practices for the EcoTrack Node.js backend.

The agent MUST apply these security principles when implementing, reviewing, testing, or refactoring backend code.

Security must be considered throughout development, not added as an afterthought.

## 2. General Security Principles

- Follow the principle of least privilege.
- Apply defense in depth.
- Never trust client-provided data.
- Validate all external inputs.
- Use secure defaults.
- Fail securely.
- Never expose sensitive information.
- Avoid unnecessary security complexity.
- Follow OWASP security recommendations.

## 3. Input Validation

- Validate all incoming request data.
- Validate request bodies, query parameters, route parameters, and uploaded files.
- Use schema-based validation.
- Reject invalid data before executing business logic.
- Enforce appropriate length, type, format, and range restrictions.
- Never rely exclusively on frontend validation.
- Prevent mass-assignment vulnerabilities by explicitly selecting accepted fields.

## 4. Database Security

- Use Prisma's parameterized queries whenever possible.
- Never construct SQL queries by directly concatenating user input.
- Use parameterized raw SQL when raw queries are necessary.
- Never expose database credentials.
- Apply database transactions when multiple related operations must succeed or fail together.
- Enforce authorization before accessing or modifying user-owned records.
- Avoid returning unnecessary database fields.

## 5. Authentication and Authorization

- Never assume that an authenticated user is automatically authorized to perform an operation.
- Verify ownership before accessing or modifying user-owned resources.
- Enforce role-based permissions where applicable.
- Never trust user IDs supplied by the client to determine the acting user.
- Obtain the authenticated user's identity from the existing authentication mechanism.
- Do not implement a new authentication system when an existing one is available.

## 6. File Upload Security

Garbage report photographs must be handled securely.

- Enforce the maximum of five photographs per report.
- Validate file types using actual file content where practical, not only filename extensions or MIME headers.
- Enforce a configurable maximum file size.
- Generate server-side filenames.
- Never trust client-provided filenames or storage paths.
- Prevent path traversal.
- Store uploaded files outside publicly executable directories.
- Use the existing external file-storage abstraction.
- Never execute uploaded files.
- Clean up orphaned files when database operations fail.
- Avoid exposing internal storage credentials or sensitive storage paths.

## 7. API Security

- Use appropriate HTTP methods and status codes.
- Apply request size limits.
- Prevent excessive resource consumption.
- Avoid exposing stack traces or internal implementation details.
- Return consistent and safe error responses.
- Configure CORS according to the project's requirements.
- Apply rate limiting to sensitive or abuse-prone endpoints where appropriate.

## 8. Sensitive Information

The agent MUST NOT:

- Hardcode passwords, API keys, tokens, or database credentials.
- Commit `.env` files containing secrets.
- Log passwords, authentication tokens, or sensitive personal information.
- Return internal errors, stack traces, or secrets to clients.
- Expose sensitive information through API responses.

Use environment variables or an approved secrets-management mechanism.

## 9. TypeScript Security Practices

- Avoid using `any` unnecessarily.
- Treat external data as `unknown` until validated.
- Do not use TypeScript type assertions as a substitute for runtime validation.
- Avoid unsafe type conversions.
- Handle nullable and optional values explicitly.
- Avoid unsafe deserialization and dynamic code execution.

## 10. Error Handling and Logging

- Handle expected errors explicitly.
- Use centralized error handling.
- Do not expose internal exception details to API clients.
- Log sufficient diagnostic information without recording secrets.
- Avoid swallowing unexpected errors silently.
- Ensure failed operations do not leave inconsistent database state.

## 11. Security Testing

For every relevant feature, write security-focused tests.

Consider at least:

- Missing or invalid input.
- Unauthorized requests.
- Access to another user's resources.
- SQL injection attempts.
- Invalid file uploads.
- Excessive file uploads.
- Oversized requests.
- Invalid coordinates.
- Unexpected input types.
- Attempts to modify protected fields.
- Error responses that could expose sensitive information.

Follow Red–Green–Refactor when writing tests and implementing fixes.

## 12. Security Review Before Completion

Before considering a task complete, verify:

1. All external inputs are validated.
2. Authorization is enforced.
3. Database operations are safe.
4. Uploaded files are validated and handled securely.
5. Sensitive information is protected.
6. Errors do not expose internal details.
7. Relevant security tests pass.
8. No new security vulnerabilities were introduced.

If a security issue is discovered, fix it before considering the task complete.

If a security requirement conflicts with the existing architecture or project specifications, report the conflict and request clarification rather than silently changing the architecture.