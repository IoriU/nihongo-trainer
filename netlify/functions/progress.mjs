// にほんご Trainer — progress sync backend (Netlify Function v2 + Netlify Blobs).
//
// Stores the single progress JSON for the owner, gated by a shared passcode.
// Set SYNC_SECRET in the Netlify dashboard (Site settings -> Environment variables).
// Until it's set, every request is rejected (fail closed), so the site is safe
// to be public — strangers can use the app locally but cannot read or write
// your synced data without the secret.
//
//   GET  /.netlify/functions/progress   -> { data: <state|null> }
//   PUT  /.netlify/functions/progress   (body = state JSON) -> { ok: true }

import { getStore } from "@netlify/blobs";

const KEY = "progress";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" }
  });
}

export default async (req) => {
  const expected = process.env.SYNC_SECRET || "";
  const given = req.headers.get("x-sync-secret") || "";

  // Fail closed: no server secret configured, or it doesn't match.
  if (!expected || given.length !== expected.length || given !== expected) {
    return json({ error: "unauthorized" }, 401);
  }

  const store = getStore("nihongo-progress");

  try {
    if (req.method === "GET") {
      const data = await store.get(KEY, { type: "json" });
      return json({ data: data ?? null });
    }
    if (req.method === "PUT" || req.method === "POST") {
      const body = await req.json();
      await store.setJSON(KEY, body);
      return json({ ok: true });
    }
    return json({ error: "method not allowed" }, 405);
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
};
