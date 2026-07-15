const query = process.argv.slice(2).join(" ");

if (!query) {
  console.error("Usage: node scripts/inspectImageSearch.mjs <query>");
  process.exit(1);
}

const response = await fetch(
  `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`,
  {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 BoardHouse/1.0",
    },
  }
);

const html = await response.text();
const urls = [...html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)]
  .map((match) =>
    match[1]
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", "\"")
      .replaceAll("&#39;", "'")
      .replaceAll("\\/", "/")
  )
  .slice(0, 20);

for (const [index, url] of urls.entries()) {
  console.log(`${index + 1}. ${url}`);
}
