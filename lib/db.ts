import fs from "fs";
import path from "path";

// On Vercel and other serverless platforms the project root is read-only.
// We write to /tmp/skill-data there, and fall back to the bundled data dir for reads.
const BUNDLE_DATA_DIR = path.join(process.cwd(), "data");
const WRITE_DATA_DIR = process.env.VERCEL ? "/tmp/skill-data" : BUNDLE_DATA_DIR;

export function readDB<T>(file: string, fallback: T): T {
  const dirs =
    WRITE_DATA_DIR !== BUNDLE_DATA_DIR
      ? [WRITE_DATA_DIR, BUNDLE_DATA_DIR]
      : [BUNDLE_DATA_DIR];

  for (const dir of dirs) {
    try {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
      }
    } catch {
      // try next dir
    }
  }
  return fallback;
}

export function writeDB<T>(file: string, data: T): void {
  if (!fs.existsSync(WRITE_DATA_DIR)) {
    fs.mkdirSync(WRITE_DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(
    path.join(WRITE_DATA_DIR, file),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}
