# React + TypeScript + Vite

## Local Razorpay checkout

The registration page uses a local Express API to create Razorpay orders and verify payment signatures. The Razorpay key secret is read only by the backend and must never use a `VITE_` prefix.

After payment, the backend sends the registration to the Google Apps Script deployment. Its `doPost` handler must parse `e.postData.contents`, append the row, and return a success acknowledgment such as `ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON)`. A successful browser confirmation is shown only when this acknowledgment is received.

### Connect the registration spreadsheet

1. Open the destination spreadsheet and select **Extensions → Apps Script** to create a script bound to that spreadsheet.
2. Replace the editor contents with [`apps-script/Code.gs`](./apps-script/Code.gs), then save. The handler appends registrations to the first tab in the order of its header constants.
3. In Apps Script, choose **Deploy → New deployment → Web app**, set **Execute as** to your account and access to **Anyone**, then deploy and authorize it.
4. Copy the deployment's `/exec` URL (not the Google Sheets URL) into both `APPS_SCRIPT_URL` and `VITE_APPS_SCRIPT_URL` in the local `.env`, then restart `npm run dev`. Configure `APPS_SCRIPT_URL` on the production Node host as well.
5. Confirm the Apps Script deployment is the latest version whenever you change its code.

For Vercel, the API is exposed through [`api/[...path].js`](./api/[...path].js). Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `APPS_SCRIPT_URL` under the Vercel project's environment variables, then redeploy. The secret must not use a `VITE_` prefix.

1. Copy `.env.example` to `.env`.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` using your current Razorpay test credentials. Rotate any secret previously shared or exposed.
3. Keep `VITE_APPS_SCRIPT_URL` set to the registration Google Apps Script URL.
4. Run `npm run dev`. Vite serves the frontend and proxies `/api` requests to the local Express server.
5. Test a registration using Razorpay test mode.

For deployment to a Node host, run `npm run build` and `npm start` on a host that supports Express. Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `APPS_SCRIPT_URL`, and `PORT` as host environment variables. `VITE_APPS_SCRIPT_URL` remains supported as a local compatibility fallback. Do not commit `.env`.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Tracks content status

The four track names and taglines in `src/data/tracks.ts` are provisional project content and have not been confirmed as official by the organizers. Track descriptions and expandable details are editable placeholders. Replace them only when confirmed track information is supplied; do not add problem statements or other track-specific claims before then. The Four Houses are a separate part of the website and must not be merged with the Tracks.
