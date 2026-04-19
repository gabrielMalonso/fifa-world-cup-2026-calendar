import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const buildDir = path.join(projectRoot, ".site-build");

if (!fs.existsSync(buildDir)) {
  throw new Error("Build não encontrado. Rode `npm run site:build` antes.");
}

for (const target of ["index.html", "assets", "favicon.png"]) {
  const destination = path.join(projectRoot, target);
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }
}

for (const entry of fs.readdirSync(buildDir)) {
  const source = path.join(buildDir, entry);
  const destination = path.join(projectRoot, entry);
  fs.cpSync(source, destination, { recursive: true });
}

console.log("Site publicado na raiz do repositório.");
