import fs from "node:fs";
import path from "node:path";

function rmIfExists(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

const cwd = process.cwd();
rmIfExists(path.join(cwd, ".next"));
rmIfExists(path.join(cwd, "node_modules", ".cache"));



