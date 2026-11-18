import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const WHO = ["Husain", "Sarah", "Both"];

function clean(body, id) {
  const title = String(body.title || "").trim().slice(0, 120);
  const date = String(body.date || "");
  let endDate = String(body.endDate || date);
  if (!title || !DATE_RE.test(date)) return null;
  if (!DATE_RE.test(endDate) || endDate < date) endDate = date;
  const time = TIME_RE.test(body.time || "") ? body.time : "";
  const endTime = TIME_RE.test(body.endTime || "") ? body.endTime : "";
  const who = WHO.includes(body.who) ? body.who : "Both";
  const notes = String(body.notes || "").slice(0, 1000);
  return { id, title, date, endDate, time, endTime, who, notes, updatedAt: new Date().toISOString() };
}

export default async (req) => {
  const passcode = process.env.CALENDAR_PASSCODE;
  if (!passcode) return json({ error: "CALENDAR_PASSCODE is not set in Netlify environment variables." }, 500);
  if (req.headers.get("x-passcode") !== passcode) return json({ error: "Wrong passcode" }, 401);

  const store = getStore({ name: "calendar", consistency: "strong" });

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const events = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    return json({ events });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
    const id = /^[a-zA-Z0-9-]{8,64}$/.test(body.id || "") ? body.id : crypto.randomUUID();
    const ev = clean(body, id);
    if (!ev) return json({ error: "Title and a valid date are required" }, 400);
    await store.setJSON(id, ev);
    return json({ event: ev });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);
    await store.delete(id);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/events" };
