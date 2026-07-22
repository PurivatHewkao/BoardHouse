import cors from "cors";
import express from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedData, seedVersion, storageKeys } from "../src/data/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.BOARDHOUSE_DB_PATH || path.join(__dirname, "db.json");

const app = express();
const port = Number(process.env.PORT || getArgValue("--port") || 3000);
const host = process.env.HOST || getArgValue("--host") || "127.0.0.1";
const allowedKeys = new Set(Object.values(storageKeys));
let writeQueue = Promise.resolve();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

function freshSeedDatabase() {
  return {
    version: seedVersion,
    storage: {
      ...seedData,
      [storageKeys.seedVersion]: seedVersion,
    },
  };
}

async function readDatabase() {
  try {
    const raw = await readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!parsed.storage || parsed.version !== seedVersion) {
      return freshSeedDatabase();
    }

    return parsed;
  } catch {
    return freshSeedDatabase();
  }
}

async function writeDatabase(database) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function queueWrite(task) {
  const queued = writeQueue.then(task, task);
  writeQueue = queued.catch(() => {});
  return queued;
}

function validateStorageKey(req, res, next) {
  if (!allowedKeys.has(req.params.key)) {
    return res.status(404).json({ message: "Unknown storage key." });
  }

  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    name: "BoardHouse API",
    storage: dbPath,
  });
});

app.get("/api/storage", async (_req, res) => {
  const database = await readDatabase();
  res.json({ storage: database.storage });
});

app.post("/api/storage/reset", async (_req, res) => {
  const database = await queueWrite(async () => {
    const freshDatabase = freshSeedDatabase();
    await writeDatabase(freshDatabase);
    return freshDatabase;
  });

  res.json({ ok: true, storage: database.storage });
});

app.get("/api/storage/:key", validateStorageKey, async (req, res) => {
  const database = await readDatabase();
  res.json({ value: database.storage[req.params.key] ?? null });
});

app.put("/api/storage/:key", validateStorageKey, async (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body || {}, "value")) {
    return res.status(400).json({ message: "Request body must include a value field." });
  }

  const value = await queueWrite(async () => {
    const database = await readDatabase();
    database.storage[req.params.key] = req.body.value;
    await writeDatabase(database);
    return database.storage[req.params.key];
  });

  return res.json({ ok: true, value });
});

app.delete("/api/storage/:key", validateStorageKey, async (req, res) => {
  await queueWrite(async () => {
    const database = await readDatabase();
    delete database.storage[req.params.key];
    await writeDatabase(database);
  });

  res.json({ ok: true });
});

app.listen(port, host, async () => {
  const database = await readDatabase();
  await writeDatabase(database);

  console.log(`BoardHouse API running at http://${host}:${port}`);
  console.log(`Storage file: ${dbPath}`);
});
