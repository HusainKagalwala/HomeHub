# Our Calendar — shared calendar for Netlify

A month-view calendar you and Sarah both edit. Events live in Netlify Blobs
(built into Netlify, no database to set up). Access is protected by one shared passcode.

## Deploy (about 5 minutes)

1. Put this folder in a GitHub repo (or use `netlify deploy` from the CLI —
   drag-and-drop deploys do NOT run Functions, so use Git or the CLI).
2. In Netlify: **Add new site → Import from Git**, pick the repo. Defaults are fine
   (publish dir `public`, functions `netlify/functions`, both set in `netlify.toml`).
3. **Site configuration → Environment variables**: add `CALENDAR_PASSCODE` with the
   passcode you and Sarah will share. Then redeploy (Deploys → Trigger deploy).
4. Open the site URL, enter the passcode, and send the link + passcode to Sarah.
   Tip: "Add to Home Screen" on your phones for an app-like icon.

## Using it
- Click any day (or **+ Add event**) to create an event; click an event to edit or delete it.
- Pick Husain / Sarah / Both to colour-code. Multi-day events use the End date.
- The page re-syncs every 30 seconds and whenever you return to the tab.

## CLI deploy alternative
    npm i -g netlify-cli
    npm install
    netlify login && netlify init     # link/create the site
    netlify env:set CALENDAR_PASSCODE "your-passcode"
    netlify deploy --prod
