const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
const headers = {
"Content-Type": "application/json",
"Cache-Control": "no-store"
};

if (event.httpMethod === "OPTIONS") {
return { statusCode: 204, headers };
}

if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
return {
statusCode: 405,
headers,
body: JSON.stringify({ error: "Method not allowed" })
};
}

const expectedPassword = process.env.PIXORA_ADMIN_PASSWORD;

if (!expectedPassword) {
return {
statusCode: 503,
headers,
body: JSON.stringify({ error: "Admin password is not configured." })
};
}

const suppliedPassword = event.headers["x-admin-password"];

if (suppliedPassword !== expectedPassword) {
return {
statusCode: 401,
headers,
body: JSON.stringify({ error: "Unauthorized" })
};
}

try {
const store = getStore("pixora-images");

if (event.httpMethod === "GET") {
  const { blobs } = await store.list();
  const images = [];

  for (const blob of blobs) {
    const data = await store.get(blob.key, { type: "json" });
    if (data) images.push(data);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ images })
  };
}

const data = JSON.parse(event.body || "{}");

if (
  !data.title ||
  !data.category ||
  !data.imageUrl ||
  !/^https?:\/\//i.test(data.imageUrl)
) {
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: "Title, category and valid image URL are required." })
  };
}

const id = Date.now().toString();

const image = {
  id,
  title: String(data.title).slice(0, 200),
  category: String(data.category).slice(0, 80),
  tags: Array.isArray(data.tags) ? data.tags.map(String).slice(0, 30) : [],
  imageUrl: String(data.imageUrl),
  source: String(data.source || "Pixora").slice(0, 200),
  license: String(data.license || "Pixora Free License").slice(0, 100),
  createdAt: new Date().toISOString()
};

await store.setJSON(id, image);

return {
  statusCode: 201,
  headers,
  body: JSON.stringify({ success: true, image })
};

} catch (error) {
return {
statusCode: 500,
headers,
body: JSON.stringify({ error: "Server error. Check Netlify function logs." })
};
}
};
