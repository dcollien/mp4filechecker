// scripts/build.mjs
import { transformFile } from "@swc/core";
import { globby } from "globby";
import fs from "fs/promises";
import path from "path";

const mode = process.argv[2]; // 'cjs' or 'es'
const outDir = mode === "es" ? "es" : "cjs";

const files = await globby("src/**/*.ts");

await Promise.all(
  files.map(async (file) => {
    const { code, map } = await transformFile(file, {
      jsc: {
        parser: {
          syntax: "typescript",
        },
        target: "es2020",
      },
      module: {
        type: mode === "es" ? "es6" : "commonjs",
      },
      sourceMaps: true,
      filename: file,
    });

    const relative = path.relative("src", file).replace(/\.ts$/, ".js");
    const outPath = path.join(outDir, relative);
    const mapPath = outPath + ".map";

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, code);
    await fs.writeFile(mapPath, map);
  })
);