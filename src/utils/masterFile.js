const APPSCRIPT_URL = process.env.MASTERFILE_URL;
const APPSCRIPT_SECRET = process.env.APPSCRIPT_SECRET;

export async function appendToGoogleSheet(payload) {
  if (!APPSCRIPT_URL) {
    throw new Error("MASTERFILE_URL not configured");
  }

  if (!APPSCRIPT_SECRET) {
    throw new Error("APPSCRIPT_SECRET not configured");
  }

  const body = {
    ...payload,
    __secret: APPSCRIPT_SECRET,
  };

  console.log("Sending to sheet:", body);

  const res = await fetch(APPSCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log("Raw sheet response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response from Apps Script");
  }

  if (!data.success) {
    throw new Error(data.message || "Sheet append failed");
  }

  return data;
}
