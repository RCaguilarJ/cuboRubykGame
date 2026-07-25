const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const Cube = require("../vendor/cubejs/index.cjs");

Cube.initSolver();

const outputPath = path.join(__dirname, "..", "dist", "solver-tables.json.gz");
const tables = JSON.stringify({
  moveTables: Cube.moveTables,
  pruningTables: Cube.pruningTables,
});

fs.writeFileSync(outputPath, zlib.gzipSync(tables, { level: 9 }));
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
