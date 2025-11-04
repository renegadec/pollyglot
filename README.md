# Pollyglot

A lightweight language translation web app powered by AI.

## Prerequisites

- Node.js 18+
- An OpenAI API key

## Local Development

1) Install dependencies:

```bash
npm install
```

2) Create a `.env` file for Vite (only needed for the client-only option):

```bash
echo "VITE_OPENAI_API_KEY=sk-your-key" > .env
```

3) Start the dev server:

```bash
npm run dev
```

Open the printed localhost URL in your browser.

## Deployment to Netlify

You have two ways to deploy, depending on your security needs:

### Option A — Secure (recommended): Use a Netlify Function

This keeps your OpenAI API key on the server and off the client.

1) Add a serverless function at `netlify/functions/translate.js`:

```javascript
import OpenAI from "openai";

function extractText(response) {
  return (
    response.output_text ||
    response.output?.[0]?.content?.[0]?.text ||
    response.output?.[1]?.content?.[0]?.text ||
    ""
  );
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
  }
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }
  const { messages } = body;
  if (!Array.isArray(messages)) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages must be an array" }) };
  }
  const client = new OpenAI({ apiKey });
  try {
    const response = await client.responses.create({ model: "gpt-5", input: messages });
    const text = extractText(response);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: e.message || "OpenAI request failed" }) };
  }
}
```

2) Add `netlify.toml` so Netlify builds the app and serves the built files:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
```

3) Update the frontend to call your function (replace any direct `openai` SDK usage in `src/main.js`):

```javascript
const res = await fetch('/.netlify/functions/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});
const data = await res.json();
```

4) In Netlify, set environment variable `OPENAI_API_KEY`.

5) Deploy the repository to Netlify.

### Option B — Client-only (fastest, but insecure)

This approach exposes your API key to anyone who can view the site. Only use for prototypes.

1) Keep the browser-side SDK usage in `src/main.js`:

```javascript
import OpenAI from "openai";
const client = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
```

2) Ensure Vite builds your app on Netlify:

- Build command: `npm run build`
- Publish directory: `dist`

You can set these in site settings or include `netlify.toml` with the `[build]` section above.

3) In Netlify, set environment variable `VITE_OPENAI_API_KEY`.

4) Deploy.

## Troubleshooting

- Error: `Failed to resolve module specifier "openai". Relative references must start with either "/", "./", or "../".`
  - Cause: Serving unbuilt source files, or importing the SDK in the browser without a proper Vite build step.
  - Fix:
    - For Option A: remove the browser import and call the Netlify Function.
    - For Option B: ensure Netlify runs `npm run build` and serves `dist`.

## Security Notes

- Never commit or expose your real OpenAI API key in client code.
- Prefer Option A to keep your key server-side.
