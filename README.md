# React + Vite

```
feature forecasting:
- salesforce integration (CRM integration)

```

```
bugs:
CORS error on mobile Safari: XMLHttpRequest cannot load http://localhost:8000/api/auth/login due to access control checks
    Bug Reason:
    - Network connectivity: Mobile couldn't reach localhost:8000 or local IP addresses
    - Missing CORS origin: Render deployment URL not in backend's allowed origins
    Fix:
    - Used ngrok to create public tunnel: https://crustless-diastrophic-thi.ngrok-free.dev
    - Added Render frontend URL to backend's allowedOrigins array in server.js:

"Not Found" page after successful login 
    Bug Reason: 
    - Routing race condition: Using window.location.href instead of React Router's navigate()
    Fix: 
    - Changed from window.location.href = "/dashboard" to navigate("/dashboard") in Login.jsx

AllInvoices.jsx line 26: Fixed responses.data → response.data typo


Added ngrok URL to allowedOrigins array
Fixed CORS origin header setting syntax
Added ngrok-skip-browser-warning to allowed headers

axiosInstance.js: Added ngrok-skip-browser-warning: true header
axiosInstance.js: Changed withCredentials: false
AllInvoices.jsx: Added array validation before calling .sort()
Dashboard.jsx: Added array validation before calling .filter()
apiPaths.js: Updated BASE_URL to use ngrok URL

remote login - "error occurred during login"
    (frontend)
    - add leading forward slash: GET_PROFILE: "/api/auth/me",
    - update boolean from false: withCredentials: true

    (backend)
    - commit:'testing0'
    - enhanced cors origin detection logic for ngrok tunneling/requests
        - Some ngrok requests arrived at the backend without an origin header
        - Original fallback logic set CORS origin to localhost:5173 for requests with no origin
        - Remote users accessing through ngrok got incorrect CORS headers
        - Resulted in CORS policy violations for legitimate ngrok requests

        (before):
        Request: ngrok tunnel (no origin) → Backend → CORS: localhost:5173 ❌
        Result: "Access-Control-Allow-Origin header not present" error

        (after):
        Request: ngrok tunnel (no origin) → Backend → Detect ngrok → CORS: ngrok URL ✅
        Request: local browser (no origin) → Backend → Detect local → CORS: localhost ✅

        ngrok Header Behavior:
        Preflight OPTIONS requests often arrive without origin header
        ngrok preserves original request info in x-forwarded-host header
        Standard CORS logic only checks origin header (misses forwarded info)

        (remote access pattern):
        Remote User → Browser → ngrok tunnel → Backend
            ↓
        Headers: {
            'x-forwarded-host': 'abc123.ngrok-free.dev',
            'host': 'abc123.ngrok-free.dev',
            'origin': undefined  // ← Missing!
        
        Reports:
        - The API was right.
        - The database was right.
        - The UI was accidentally filtering out valid data using UTC timestamps.

        endDate filtering:
        - startDate defauld was not normalized to a calendar day (local midnight etc. 00:00:00)
            - the date ranges inlcude the selected end date
        }
```



This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
