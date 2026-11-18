import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const WHO = ["Husain", "Sarah", "Both", "Other"];
const TYPES = ["event", "reminder", "grocery"];
const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;

function clean(type, b, id) {
  const title = String(b.title || "").trim().slice(0, 120);
  if (!title) return null;
  const now = new Date().toISOString();
  if (type === "grocery") {
    return { id, type, title, done: !!b.done, updatedAt: now };
  }
  const who = WHO.includes(b.who) ? b.who : "Both";
  const time = TIME_RE.test(b.time || "") ? b.time : "";
  if (type === "reminder") {
    const date = DATE_RE.test(b.date || "") ? b.date : "";
    return { id, type, title, who, date, time: date ? time : "", done: !!b.done, updatedAt: now };
  }
  const date = String(b.date || "");
  if (!DATE_RE.test(date)) return null;
  let endDate = String(b.endDate || date);
  if (!DATE_RE.test(endDate) || endDate < date) endDate = date;
  const endTime = TIME_RE.test(b.endTime || "") ? b.endTime : "";
  const notes = String(b.notes || "").slice(0, 1000);
  return { id, type, title, who, date, endDate, time, endTime, notes, updatedAt: now };
}

export default async (req) => {
  const passcode = process.env.CALENDAR_PASSCODE;
  if (!passcode) return json({ error: "CALENDAR_PASSCODE is not set in Netlify environment variables." }, 500);
  if (req.headers.get("x-passcode") !== passcode) return json({ error: "Wrong passcode" }, 401);

  const store = getStore({ name: "family-hub", consistency: "strong" });

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const all = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    return json({
      events: all.filter((x) => x.type === "event"),
      reminders: all.filter((x) => x.type === "reminder"),
      groceries: all.filter((x) => x.type === "grocery"),
    });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
    if (!TYPES.includes(body.type)) return json({ error: "Bad type" }, 400);
    const id = ID_RE.test(body.id || "") ? body.id : crypto.randomUUID();
    const item = clean(body.type, body, id);
    if (!item) return json({ error: "A title (and a valid date for events) is required" }, 400);
    await store.setJSON(`${body.type}:${id}`, item);
    return json({ item });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    if (!TYPES.includes(type)) return json({ error: "Bad type" }, 400);
    if (url.searchParams.get("done") === "1") {
      const { blobs } = await store.list({ prefix: `${type}:` });
      for (const b of blobs) {
        const it = await store.get(b.key, { type: "json" });
        if (it && it.done) await store.delete(b.key);
      }
      return json({ ok: true });
    }
    const id = url.searchParams.get("id");
    if (!ID_RE.test(id || "")) return json({ error: "Missing id" }, 400);
    await store.delete(`${type}:${id}`);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/items" };
