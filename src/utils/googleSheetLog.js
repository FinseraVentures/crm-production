// utils/googleSheetLog.js
// import fetch from "node-fetch"; // omit if Node18+ and you prefer global fetch
// or: const fetch = globalThis.fetch;

const APPSCRIPT_URL = process.env.APPSCRIPT_URL; // e.g. https://script.google.com/macros/s/XXX/exec
const APPSCRIPT_SECRET = process.env.APPSCRIPT_SECRET;

export async function appendToGoogleSheet(payload) {
  // payload: { name, email, phone, amount, description, paymentLink, paymentLinkId, status }
  if (!APPSCRIPT_URL) throw new Error("APPSCRIPT_URL not configured");

  const body = {
    ...payload,
    __secret: APPSCRIPT_SECRET, // used by Apps Script to authenticate
  };

  const res = await fetch(APPSCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!data || !data.success) {
    // Optionally log the failure and/or retry
    console.error("Failed to append to Google Sheet", data);
    throw new Error(data?.message || "Failed to append to Google Sheet");
  }

  return data;
}
