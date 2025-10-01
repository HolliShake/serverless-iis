# Serverless IIS Admin

A Windows-first project to manage IIS websites via a local Go API and a React (Vite) dashboard.

- **Backend (`service/`)**: Go + Gin HTTP API that shells out to PowerShell `WebAdministration` to list, create, update, start/stop/restart, and delete IIS websites, and fetch recent IIS logs. Requires Administrator privileges.
- **Frontend (`app/`)**: React + TypeScript + Vite dashboard that consumes the API. Configurable base URL via `VITE_APP_API_URL`.

---

## Prerequisites

- Windows 10/11 with IIS installed and the PowerShell `WebAdministration` module available
- Administrator privileges to run the backend (`service`) because IIS administration requires elevation
- Go (matching `go.mod`, e.g. Go 1.24.x) for building the backend
- Node.js 18+ and npm for the frontend

---

## Project Structure

```
D:/serverless-iis/
  app/         # React + Vite frontend
  service/     # Go + Gin API, PowerShell IIS management
  readme.md    # This file
```

---

## Backend: `service/` (Go API)

### Features

- Machine info and process snapshot
- Websites listing and CRUD-like operations for IIS
- Start/Stop/Restart a site
- Tail recent IIS logs for a given site

### Endpoints

- `GET /api/` → `{ message: "IIS Server API" }`
- `GET /api/machine/info` → machine info snapshot
- `GET /api/machine/process` → list of running processes (summary strings)
- `GET /api/website` → array of websites with shape:
  ```json
  {
    "name": "MySite",
    "id": 1,
    "state": "Started",
    "physicalPath": "C:/inetpub/wwwroot/MySite",
    "bindings": {
      "protocol": "http",
      "port": 80,
      "host": "localhost",
      "ssl": false
    }
  }
  ```
- `POST /api/website` → create website
  - Body:
    ```json
    {
      "name": "MySite",
      "protocol": "http",
      "hostOrDomain": "localhost",
      "port": 8081
    }
    ```
- `PUT /api/website/` → update bindings (protocol/host/port) for existing website
  - Body: same shape as `POST`
- `PATCH /api/website/:site/:action` → control site
  - `:action` is one of `Start | Stop | Restart`
- `DELETE /api/website/:name` → delete website
- `GET /api/log/:site` → last ~50 lines from IIS logs for site

Notes:

- Host header can be empty; when not provided the parser normalizes to `localhost` for display.
- Creating a site ensures `C:\inetpub\wwwroot\<name>` exists and uses `DefaultAppPool`.

### Run (development)

```powershell
# From repo root
cd service
# Run as Administrator PowerShell or elevate the compiled binary
go run .
# The server listens on http://localhost:8080
```

If you see "You must be an administrator to run this program", re-run your terminal as Administrator or run the built `service.exe` elevated.

### Build

```powershell
cd service
go build -o service.exe .
# Then run service.exe as Administrator
```

---

## Frontend: `app/` (React + Vite)

### Configure API URL

The frontend uses Axios with base URL:

- `VITE_APP_API_URL` env var, or
- defaults to `http://localhost:8080/api`

Create `.env` in `app/` (optional):

```env
VITE_APP_API_URL=http://localhost:8080/api
```

### Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

### Run (development)

```powershell
cd app
npm install
npm run dev
# Visit the URL shown by Vite (typically http://localhost:5173)
```

Ensure the backend is running at the URL configured above; otherwise the UI will show errors when fetching.

### Build (production)

```powershell
cd app
npm run build
npm run preview
```

---

## Example Requests

```powershell
# List websites
curl http://localhost:8080/api/website

# Create website
curl -X POST http://localhost:8080/api/website `
  -H "Content-Type: application/json" `
  -d '{
    "name":"MySite",
    "protocol":"http",
    "hostOrDomain":"localhost",
    "port":8081
  }'

# Update website binding
curl -X PUT http://localhost:8080/api/website/ `
  -H "Content-Type: application/json" `
  -d '{
    "name":"MySite",
    "protocol":"http",
    "hostOrDomain":"localhost",
    "port":8082
  }'

# Start/Stop/Restart
curl -X PATCH http://localhost:8080/api/website/MySite/Start
curl -X PATCH http://localhost:8080/api/website/MySite/Stop
curl -X PATCH http://localhost:8080/api/website/MySite/Restart

# Delete website
curl -X DELETE http://localhost:8080/api/website/MySite

# Get recent logs
curl http://localhost:8080/api/log/MySite
```

---

## Troubleshooting

- Run the backend as **Administrator** or it will exit with an error.
- Ensure IIS role and `WebAdministration` module are installed: `Import-Module WebAdministration` in PowerShell should succeed.
- Port conflicts: the API listens on `:8080`, and new sites bind to the specified port; change as needed.
- If logs are empty, verify the site has traffic and that log folder exists under `C:\inetpub\logs\LogFiles`.
- Frontend requests failing: confirm `VITE_APP_API_URL` matches the backend URL and CORS is allowed (CORS is enabled by default in the service).

---

## License

MIT
