# Garbage Reporting API — F02

EcoTrack Garbage Reporting Management backend API. Allows registered citizens to submit garbage reports with photographs, locations, and descriptions; edit eligible reports; and track report status and history.

**Scope:** F02 – Garbage Reporting Management only. Authentication, notifications, AI waste classification, cleanup missions, and rewards are out of scope.

---

## 1. Base URL and Conventions

- Development base URL: `http://localhost:5000`
- API base path: `/api`
- Content-Type: `application/json` for JSON bodies; `multipart/form-data` for report creation with file uploads
- Dates/times: ISO 8601 UTC strings
- Location: latitude and longitude are transmitted as separate decimal fields; stored internally as a MySQL `POINT` (SRID 4326), where `X = longitude`, `Y = latitude`

---

## 2. Authentication and Authorization

Authentication is **not implemented** in this feature scope. The acting user's identity must be obtained from the existing authentication middleware when available (`req.user`).

Authorization rules:
- Users can only create reports under their own identity.
- Users can only read/edit their own reports unless they hold administrative permissions.
- Ownership is enforced before accessing or modifying any user-owned report.
- Client-supplied user IDs are never trusted to determine the acting user.

---

## 3. Endpoints

### 3.1 Health Check

`GET /api/health`

Verifies the API is running.

**Success response (200):**
```json
{
  "status": "success",
  "message": "EcoTrack API is running"
}
```

---

### 3.2 Create Garbage Report (US02.1)

`POST /api/reports`

Submits a new garbage report. Photographs and description are optional; a valid location and waste category are mandatory.

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | yes | Report title, 1–255 characters |
| `description` | string | no | Optional description |
| `category` | string | yes | Waste category (see Enums) |
| `latitude` | number | yes | -90 to 90 |
| `longitude` | number | yes | -180 to 180 |
| `location_source` | string | no | `GPS` or `MANUAL` (default `GPS`) |
| `location_accuracy` | number | no | GPS accuracy in meters, >= 0 |
| `images` | file[] | no | Up to 5 images (see File Upload Rules) |

**Success response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "rep_1234567890",
    "user_id": "usr_1234567890",
    "category": "PLASTIC",
    "title": "Illegal dumping near riverbank",
    "description": "Large pile of plastic bags and bottles.",
    "location": { "latitude": -6.2088, "longitude": 106.8456 },
    "location_source": "GPS",
    "location_accuracy": 5.2,
    "status": "PENDING",
    "created_at": "2026-11-15T08:03:48Z",
    "updated_at": "2026-11-15T08:03:48Z",
    "images": []
  }
}
```

**Rejection conditions:**
- Missing or invalid latitude/longitude → 400
- More than 5 photographs → 400 / 413
- Unsupported photograph format → 400 / 415
- Photograph exceeding the configured file-size limit → 400 / 413
- Invalid waste category → 400

---

### 3.3 List User's Reports (US02.3)

`GET /api/reports`

Returns the authenticated user's submitted reports with current status.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | string | no | Filter by `PENDENT`/`APPROVED`/`RESOLVED`/`REJECTED` |
| `page` | integer | no | Page number, default 1 |
| `limit` | integer | no | Page size, default 20, max 100 |

**Success response (200):**
```json
{
  "status": "success",
  "data": {
    "reports": [
      {
        "id": "rep_1234567890",
        "category": "PLASTIC",
        "title": "Illegal dumping near riverbank",
        "status": "PENDING",
        "location": { "latitude": -6.2088, "longitude": 106.8456 },
        "created_at": "2026-11-15T08:03:48Z",
        "updated_at": "2026-11-15T08:03:48Z",
        "image_count": 0
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1 }
  }
}
```

---

### 3.4 Get Report Details (US02.3)

`GET /api/reports/:id`

Returns a single report with its images. Ownership is enforced.

**Success response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "rep_1234567890",
    "user_id": "usr_1234567890",
    "category": "PLASTIC",
    "title": "Illegal dumping near riverbank",
    "description": "Large pile of plastic bags and bottles.",
    "location": { "latitude": -6.2088, "longitude": 106.8456 },
    "location_source": "GPS",
    "location_accuracy": 5.2,
    "status": "PENDING",
    "created_at": "2026-11-15T08:03:48Z",
    "updated_at": "2026-11-15T08:03:48Z",
    "images": [
      { "id": "img_1", "report_id": "rep_1234567890", "image_path": "/storage/reports/rep_1234567890/img_1.jpg", "created_at": "2026-11-15T08:03:48Z" }
    ]
  }
}
```

**Errors:** 404 if not found; 403 if the authenticated user does not own the report.

---

### 3.5 Get Report Status History (US02.3)

`GET /api/reports/:id/history`

Returns the status change history for a report. Ownership is enforced.

**Success response (200):**
```json
{
  "status": "success",
  "data": {
    "report_id": "rep_1234567890",
    "history": [
      {
        "id": "hist_1",
        "report_id": "rep_1234567890",
        "changed_by": "usr_1234567890",
        "old_status": null,
        "new_status": "PENDING",
        "note": "Report submitted",
        "created_at": "2026-11-15T08:03:48Z"
      }
    ]
  }
}
```

---

### 3.6 Edit Report (US02.2)

`PUT /api/reports/:id`

Edits an eligible report. Only reports in a permitted (editable) status may be modified; every successful edit is recorded in `report_history`. Only the report owner may edit unless the user has administrative permissions.

**Request (multipart/form-data or application/json):**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | no | 1–255 characters |
| `description` | string | no | Optional description |
| `category` | string | no | Waste category |
| `latitude` | number | no | -90 to 90 |
| `longitude` | number | no | -180 to 180 |
| `location_source` | string | no | `GPS` or `MANUAL` |
| `location_accuracy` | number | no | >= 0 |

**Success response (200):** updated report object (same shape as 3.4).

**Errors:** 404 not found; 403 not owner; 409 if the report is in a restricted processing state (not editable); 400 for invalid input.

---

## 4. Request/Response Schemas

### 4.1 Enums

`waste_category`: `PLASTIC` \| `PAPER` \| `GLASS` \| `METAL` \| `CARDBOARD` \| `BIOLOGICAL`

`report_status`: `PENDING` \| `APPROVED` \| `RESOLVED` \| `REJECTED`

`location_source`: `GPS` \| `MANUAL`

### 4.2 Report object

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique report identifier |
| `user_id` | string | Reporting user |
| `category` | waste_category | Required |
| `title` | string | Required |
| `description` | string \| null | Optional |
| `location` | `{ latitude, longitude }` | Decimal degrees |
| `location_source` | location_source | Required |
| `location_accuracy` | number \| null | Meters |
| `status` | report_status | Default `PENDING` |
| `created_at` | string | ISO 8601 UTC |
| `updated_at` | string \| null | ISO 8601 UTC |

### 4.3 ReportImage object

| Field | Type |
|---|---|
| `id` | string |
| `report_id` | string |
| `image_path` | string |
| `created_at` | string |

### 4.4 ReportHistoryEntry object

| Field | Type |
|---|---|
| `id` | string |
| `report_id` | string |
| `changed_by` | string \| null |
| `old_status` | report_status \| null |
| `new_status` | report_status |
| `note` | string \| null |
| `created_at` | string |

### 4.5 Pagination object

| Field | Type |
|---|---|
| `page` | integer |
| `limit` | integer |
| `total` | integer |

### 4.6 Error object

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [ { "field": "latitude", "message": "required" } ]
  }
}
```

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE_ENTITY`, `INTERNAL_ERROR`.

---

## 5. HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — successful read or update |
| 201 | Created — report submitted |
| 400 | Bad request — validation failure |
| 401 | Unauthorized — authentication required |
| 403 | Forbidden — not the owner / insufficient permissions |
| 404 | Not found — report does not exist |
| 409 | Conflict — report not in an editable status |
| 413 | Payload too large — too many or oversized files |
| 415 | Unsupported media type — invalid file format |
| 500 | Internal server error |

---

## 6. Business Rules and Validation

- A report may be submitted with no photographs and no description.
- Up to 5 supported photographs per report.
- Valid latitude and longitude are mandatory (GPS or manual map selection).
- Newly submitted reports enter `PENDING` status.
- Only `PENDING` reports (permitted status) may be edited.
- Every successful edit is recorded in `report_history`.
- Users own their reports; cross-user access is rejected.
- File names are generated server-side; client file names and paths are never trusted.
- File type is validated by content, not only by extension/MIME header.
- Uploaded files are stored outside publicly executable directories and are never executed.

---

## 7. File Upload Rules

| Rule | Limit |
|---|---|
| Max photographs per report | 5 |
| Supported formats | JPEG, PNG, WEBP |
| Max file size | configured via `MAX_FILE_SIZE_MB` (recommended 5 MB) |
| File name | server-generated |
| Storage | external file storage abstraction |

---

## 8. Security

- All external inputs are schema-validated before business logic runs.
- Parameterized queries only; no string-concatenated SQL.
- Database transactions wrap report creation (report + images + history) and edits.
- Stack traces and internal error details are never returned to clients.
- CORS is configured per project requirements.
- Rate limiting is recommended on submission endpoints.
- `.env` secrets are never committed.

---

## 9. Architecture Mapping

Per `docs/architecture.puml`:

```
Frontend → Routes → Controllers → Services → IReportRepository
                                            ↑
                                  MySQLReportRepository → MySQL DB
                                                              ↑
                                                      External File Storage
```

Layers:
- **Routes:** Express route definitions for `/api/reports`
- **Controllers:** HTTP request/response handling and validation orchestration
- **Services:** `CreateReportService`, `UpdateReportService`, `TrackReportService` (business logic)
- **Repository Layer:** `ReportRepository` interface + MySQL implementation handling report and image access

---

## 10. Example cURL

Submit a report:
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer <token>" \
  -F "title=Illegal dumping near riverbank" \
  -F "description=Large pile of plastic bags and bottles." \
  -F "category=PLASTIC" \
  -F "latitude=-6.2088" \
  -F "longitude=106.8456" \
  -F "location_source=GPS" \
  -F "images=@photo1.jpg"
```

List reports:
```bash
curl -X GET "http://localhost:5000/api/reports?status=PENDING&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```
