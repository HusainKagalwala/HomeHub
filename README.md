# Our Calendar: shared family hub for Netlify

Month / Week / Agenda calendar, reminders, grocery list, clock + weather, dark/light toggle,
and Dawoodi Bohra (Fatimi) Hijri dates with miqaats and ayyam. Data is stored in Netlify Blobs,
protected by one shared passcode.

## First deploy with the Netlify CLI (no git)
    npm install
    npx netlify-cli login
    npx netlify-cli deploy --prod          # choose "Create & configure a new project"
    npx netlify-cli env:set CALENDAR_PASSCODE "your-passcode"
    npx netlify-cli deploy --prod          # redeploy so the function sees the passcode

## Updating later WITHOUT losing your events
Your events, reminders and groceries live in Netlify Blobs, separate from the code. Deploying a new
version never touches them, as long as you deploy to the SAME Netlify site:

    npx netlify-cli link                   # once per computer: pick your existing site
    npx netlify-cli deploy --prod

Do NOT choose "Create & configure a new project" again. A new site starts with empty storage.
(If you ever do, your old site still has the data. Use Settings > Export there and Import on the new one.)

Safety net: gear icon > Export downloads all data as a JSON file; Import restores it (it only adds or
updates, it never deletes). Export one before big changes.

Rules for anyone editing the code: never rename the store "family-hub" or the key format "<type>:<id>"
in netlify/functions/items.mjs, and keep miqaats in public/miqaats.js (separate from app logic).

## Prayer times
Calculated in the browser from public/prayer.js (no outside service). Location is PRAYER_LOC there
(default Mississauga). Pick a method and nudge each prayer by +/- minutes in the gear menu until it matches
your jamaat's timetable, or edit the angles in PRAYER_METHODS.

## Tweaks
- Bohra miqaats and ayyam: public/miqaats.js (one line each). Hijri on/off, +/-1 day adjust, and
  All/Major miqaats: gear icon (saved per device).
- Weather location: WEATHER = { lat, lon } near the top of the script in public/index.html.
