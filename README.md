# Our Calendar: shared family hub for Netlify

Month / Week / Agenda calendar, reminders, grocery list, clock + weather, dark/light toggle,
and Dawoodi Bohra (Fatimi) Hijri dates. Data is stored in Netlify Blobs, protected by one shared passcode.

## Deploy with the Netlify CLI (no git)
    npm install
    npx netlify-cli login
    npx netlify-cli deploy --prod          # choose "Create & configure a new project"
    npx netlify-cli env:set CALENDAR_PASSCODE "your-passcode"
    npx netlify-cli deploy --prod          # redeploy so the function sees the passcode

## Or deploy from GitHub
Upload this folder to a repo, import it in Netlify, add CALENDAR_PASSCODE under
Site configuration > Environment variables, then redeploy.

## Tweaks (public/index.html)
- Weather location: WEATHER = { lat, lon } near the top of the script (default Mississauga).
- Bohra occasions: BOHRA_OCCASIONS list.
- Hijri on/off and +/-1 day adjust: gear icon (saved per device).
