# React + TypeScript + Vite

## Round 1 registration

Round 1 registration is free and requires a Project PPT / deck upload in `.ppt`, `.pptx`, or `.pdf` format. Files are limited to 3 MB. The backend relays validated team details and the upload to the Google Apps Script deployment; the app confirms registration only after Apps Script saves the deck and sheet row and sends a confirmation email to the Team Leader.

### Connect the registration spreadsheet

1. Open the destination spreadsheet and select **Extensions → Apps Script** to create a script bound to that spreadsheet.
2. Replace the editor contents with [`apps-script/Code.gs`](./apps-script/Code.gs), then save. Set `PPT_FOLDER_ID` to the destination Drive folder ID. The handler appends registration data and the uploaded deck URL to the `Registrations` tab (or the first tab if it does not exist). Uploaded decks are shared with **anyone who has the link**.
3. In Apps Script, choose **Deploy → New deployment → Web app**, set **Execute as** to your account and access to **Anyone**, then deploy and authorize spreadsheet, Drive, and email access.
4. Copy the deployment's `/exec` URL (not the Google Sheets URL) into `APPS_SCRIPT_URL` in the local `.env`, then restart `npm run dev`. Configure `APPS_SCRIPT_URL` on the production Node host or Vercel as well.
5. Confirm the Apps Script deployment is the latest version whenever you change its code.

For Vercel, the API is exposed through [`api/[...path].js`](./api/[...path].js) and uses the shared Express application in [`server/app.js`](./server/app.js). Configure `APPS_SCRIPT_URL` under the Vercel project's environment variables, then redeploy.

1. Copy `.env.example` to `.env` and set `APPS_SCRIPT_URL` to your registration Google Apps Script URL.
2. Run `npm run dev`. Vite serves the frontend and proxies `/api` requests to the local Express server.
3. Test a registration with a valid team, a supported deck, and a file no larger than 3 MB.

For deployment to a Node host, run `npm run build` and `npm start` on a host that supports Express. Configure `APPS_SCRIPT_URL` and `PORT` as host environment variables. Do not commit `.env`.

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
