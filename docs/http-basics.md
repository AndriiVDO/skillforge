# HTTP basics in SkillForge

## Request and response

An HTTP request includes a method, URL, headers, and optionally a body.
The server returns a status code, headers, and optionally a response body.

## Application flow

When an administrator saves a topic:

1. The browser sends a POST request to a Next.js Server Action.
2. The Next.js server sends a PUT request to the ASP.NET Core API,
   including the administrator's Bearer token.
3. The API validates authorization and input, then updates PostgreSQL.
4. Next.js refreshes the affected pages and redirects to the topic.

The browser's Network panel shows the request to Next.js.
The server-to-server PUT request does not appear there.

## HTTP methods

| Method | SkillForge example   | Purpose              |
| ------ | -------------------- | -------------------- |
| GET    | `/api/topics/linux`  | Read a topic         |
| POST   | `/api/topics`        | Create a topic       |
| PUT    | `/api/topics/{slug}` | Update topic details |
| DELETE | `/api/topics/{slug}` | Delete a topic       |

Write endpoints require an authenticated administrator.

## Reproduce the checks

Run these commands in PowerShell while the API is available.

### Read an existing published topic

```powershell
curl.exe -sS -i http://localhost:5050/api/topics/linux
```

Expected: `200 OK` and a JSON response containing the topic.

### Read a missing topic

```powershell
curl.exe -sS -i http://localhost:5050/api/topics/topic-that-does-not-exist
```

Expected: `404 Not Found`.

```json
{ "message": "Topic not found." }
```

### Request identity without a token

```powershell
curl.exe -sS -i http://localhost:5050/api/auth/me
```

Expected: `401 Unauthorized`, an empty body, and this header:

```http
WWW-Authenticate: Bearer
```

### Attempt a write without a token

```powershell
curl.exe -sS -i -X POST http://localhost:5050/api/topics/linux/lessons -H "Content-Type: application/json" --data-raw "{}"
```

Expected: `401 Unauthorized`. No task is created.

## Headers observed

| Header                           | Meaning                                    |
| -------------------------------- | ------------------------------------------ |
| `Content-Type: application/json` | The response body is JSON                  |
| `Cache-Control: no-store`        | Caches must not store the response         |
| `WWW-Authenticate: Bearer`       | The endpoint expects Bearer authentication |
| `Content-Length: 0`              | The response body is empty                 |

## Browser DevTools

Open Network before submitting the edit form.

- Headers: inspect the URL, method, status, and headers.
- Payload: inspect the submitted form fields.
- Response: inspect the data returned by the server.

A Next.js Server Action can return `text/x-component`.
This is React's component data format; it differs from the JSON returned
directly by the ASP.NET Core API.
