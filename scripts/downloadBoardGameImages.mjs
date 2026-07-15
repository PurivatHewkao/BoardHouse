import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const outputDir = join(process.cwd(), "public", "images", "boardgames");

const games = [
  {
    id: 13,
    name: "Catan",
    slug: "catan",
    imageUrl:
      "https://www.catan.com/sites/default/files/2025-01/CATAN_6eBaseGame_Base_Frontview.png",
  },
  { id: 9209, name: "Ticket to Ride", slug: "ticket-to-ride" },
  {
    id: 178900,
    name: "Codenames",
    slug: "codenames",
    imageUrl: "http://www.geekyhobbies.com/wp-content/uploads/2017/11/Codenames-Box.jpg",
  },
  { id: 266192, name: "Wingspan", slug: "wingspan" },
  { id: 2223, name: "Uno", slug: "uno" },
  { id: 230802, name: "Azul", slug: "azul" },
  {
    id: 39856,
    name: "Dixit",
    slug: "dixit",
    imageUrl:
      "https://cf.geekdo-images.com/J0PlHArkZDJ57H-brXW2Fw__original/img/jt3kFCHJ3HJ2079dMLwipFZqdQg=/0x0/filters:format(jpeg)/pic6738336.jpg",
  },
  {
    id: 68448,
    name: "7 Wonders",
    slug: "7-wonders",
    imageUrl: "https://theboardgamesite.com/wp-content/uploads/2024/05/7-Wonders-1019x1024.jpg",
  },
  { id: 925, name: "Werewolf", slug: "werewolf" },
  {
    id: 30549,
    name: "Pandemic",
    slug: "pandemic",
    imageUrl:
      "https://cdn.svc.asmodee.net/production-asmodeeit/uploads/2022/09/pandemic-box.png",
  },
  {
    id: 148228,
    name: "Splendor",
    slug: "splendor",
    imageUrl: "https://m.media-amazon.com/images/I/71-H11a+R2L._SL1500_.jpg",
  },
  {
    id: 822,
    name: "Carcassonne",
    slug: "carcassonne",
    imageUrl: "https://store.asmodee.com/cdn/shop/products/ZM7810-1_535x.jpg?v=1690217588",
  },
  {
    id: 128882,
    name: "The Resistance: Avalon",
    slug: "the-resistance-avalon",
  },
  { id: 172225, name: "Exploding Kittens", slug: "exploding-kittens" },
  {
    id: 133473,
    name: "Sushi Go!",
    slug: "sushi-go",
    imageUrl:
      "https://cf.geekdo-images.com/RrnjxzPnat69yC0pidKIsg__imagepage/img/XvZXaPeBa6Yitk12S0xwypGcD3M=/fit-in/900x600/filters:no_upscale():strip_icc()/pic4448071.jpg",
  },
  { id: 181304, name: "Mysterium", slug: "mysterium" },
  {
    id: 65244,
    name: "Forbidden Island",
    slug: "forbidden-island",
    imageUrl: "https://m.media-amazon.com/images/I/81dLQJZRx5L._AC_SL1500_.jpg",
  },
  { id: 254640, name: "Just One", slug: "just-one" },
  {
    id: 129622,
    name: "Love Letter",
    slug: "love-letter",
    imageUrl:
      "https://cdn.svc.asmodee.net/production-asmodeeit/uploads/image-converter/2022/09/love_letter_ECO_box.webp",
  },
  { id: 98778, name: "Hanabi", slug: "hanabi" },
  { id: 54043, name: "Jaipur", slug: "jaipur" },
  {
    id: 131357,
    name: "Coup",
    slug: "coup",
    imageUrl:
      "https://cf.geekdo-images.com/mx5ZN6ABzY8unT4Vnsyvrw__original/img/HWzO-vr0XvbMVGZzq9Uej7MN-Nw=/0x0/filters:format(jpeg)/pic5224814.jpg",
  },
  {
    id: 225694,
    name: "Decrypto",
    slug: "decrypto",
    imageUrl: "https://cdn.svc.asmodee.net/production-asmodeeit/uploads/2022/09/decrypto-box.png",
  },
  { id: 204583, name: "Kingdomino", slug: "kingdomino" },
  { id: 218603, name: "Photosynthesis", slug: "photosynthesis" },
  {
    id: 10547,
    name: "Betrayal at House on the Hill",
    slug: "betrayal-at-house-on-the-hill",
    imageUrl: "https://m.media-amazon.com/images/I/81rR1fZXQRL._AC_SL1500_.jpg",
  },
  { id: 244992, name: "The Mind", slug: "the-mind" },
  { id: 163412, name: "Patchwork", slug: "patchwork" },
  { id: 46213, name: "Telestrations", slug: "telestrations" },
  {
    id: 166384,
    name: "Spyfall",
    slug: "spyfall",
    imageUrl: "https://images.thenile.io/r1000/0815442019042.jpg",
  },
  { id: 3955, name: "Bang!", slug: "bang" },
  { id: 153938, name: "Camel Up", slug: "camel-up" },
  { id: 70919, name: "Takenoko", slug: "takenoko" },
  {
    id: 316554,
    name: "Dune: Imperium",
    slug: "dune-imperium",
    imageUrl: "https://cdn.svc.asmodee.net/production-asmodeeit/uploads/2022/09/Dune-Imperium-BOX-1024x1024.png",
  },
  { id: 237182, name: "Root", slug: "root" },
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 BoardHouse/1.0",
};

async function fetchText(url, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = await fetch(url, { headers });

    if (response.status === 202 && attempt < retries) {
      await delay(attempt * 2000);
      continue;
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  throw new Error("Timed out waiting for BoardGameGeek data.");
}

async function downloadImage(url, fileBase) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Not an image: ${contentType || "unknown content type"}`);
  }

  const urlExtension = extname(new URL(url).pathname).toLowerCase();
  const extension = contentType.includes("png")
    ? ".png"
    : contentType.includes("webp")
      ? ".webp"
      : urlExtension || ".jpg";
  const fileName = `${fileBase}${extension}`;
  const filePath = join(outputDir, fileName);
  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength < 25_000) {
    throw new Error("Image file is unexpectedly small.");
  }

  await writeFile(filePath, Buffer.from(arrayBuffer));

  return fileName;
}

async function findImageUrls(game) {
  const candidates = [];

  if (game.imageUrl) {
    candidates.push(game.imageUrl);
  }

  const bggUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${game.id}`;

  try {
    const xml = await fetchText(bggUrl);
    const imageUrl = extractTag(xml, "image");

    if (imageUrl) {
      candidates.push(imageUrl);
    }
  } catch (error) {
    console.warn(`${game.name}: BoardGameGeek API skipped (${error.message})`);
  }

  candidates.push(...(await findImageUrlsFromBing(game)));
  return [...new Set(candidates)];
}

async function findImageUrlsFromBing(game) {
  const query = encodeURIComponent(
    `"${game.name}" board game box cover front product`
  );
  const response = await fetch(
    `https://www.bing.com/images/search?q=${query}&form=HDRSC2&first=1`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Bing image search failed: ${response.status}`);
  }

  const html = await response.text();
  const urls = [...html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)]
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean);

  if (!urls.length) {
    throw new Error(`No image search results for ${game.name}.`);
  }

  const scoredUrls = urls
    .map((url, index) => ({
      url,
      score: scoreImageUrl(url, game) - index * 0.05,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return scoredUrls.map(({ url }) => url);
}

function scoreImageUrl(url, game) {
  const lowerUrl = url.toLowerCase();
  const gameWords = game.slug.split("-").filter((word) => word.length > 1);
  let score = 0;

  for (const word of gameWords) {
    if (lowerUrl.includes(word)) {
      score += 1;
    }
  }

  for (const preferred of [
    "box",
    "cover",
    "front",
    "product",
    "game",
    "boardgame",
    "board-game",
  ]) {
    if (lowerUrl.includes(preferred)) {
      score += 1.5;
    }
  }

  for (const avoided of [
    "rules",
    "rule",
    "setup",
    "layout",
    "board-set",
    "board_set",
    "review",
    "thumbnail/1600x900",
  ]) {
    if (lowerUrl.includes(avoided)) {
      score -= 3;
    }
  }

  if (lowerUrl.includes("cf.geekdo-images.com")) {
    score += 4;
  }

  return score;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("\\/", "/");
}

function extractTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>(.*?)</${tagName}>`, "s"));
  return match?.[1]?.trim();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await mkdir(outputDir, { recursive: true });

const manifest = [];

for (const game of games) {
  const imageUrls = await findImageUrls(game);
  let downloaded = null;

  for (const imageUrl of imageUrls) {
    try {
      downloaded = {
        fileName: await downloadImage(imageUrl, game.slug),
        imageUrl,
      };
      break;
    } catch (error) {
      console.warn(`${game.name}: candidate skipped (${error.message})`);
    }
  }

  if (!downloaded) {
    throw new Error(`Could not download an image for ${game.name}.`);
  }

  manifest.push({
    id: game.id,
    name: game.name,
    file: `/images/boardgames/${downloaded.fileName}`,
    source: `https://boardgamegeek.com/boardgame/${game.id}`,
    imageSource: downloaded.imageUrl,
  });

  console.log(`${game.name} -> ${downloaded.fileName}`);
}

await writeFile(
  join(outputDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(`Downloaded ${manifest.length} images to ${outputDir}`);
