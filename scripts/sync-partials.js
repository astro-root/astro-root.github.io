const fs = require("fs");
const path = require("path");
const { applyPartial } = require("./lib/apply-partial");
const targetFiles = require("./lib/file-list");

const root = path.resolve(__dirname, "..");
const partials = {
  HEADER: fs.readFileSync(path.join(root, "partials/header.html"), "utf-8"),
  FOOTER: fs.readFileSync(path.join(root, "partials/footer.html"), "utf-8")
};

let changedCount = 0;
let missingMarkerFiles = [];

for (const rel of targetFiles) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    console.warn(`[skip] ${rel} は存在しません`);
    continue;
  }
  for (const [name, content] of Object.entries(partials)) {
    const result = applyPartial(filePath, name, content);
    if (result.changed) {
      console.log(`[updated] ${rel} (${name})`);
      changedCount++;
    } else if (result.reason === "marker_not_found") {
      missingMarkerFiles.push(`${rel} (${name})`);
    }
  }
}

if (missingMarkerFiles.length) {
  console.warn("\n以下のファイルにはマーカーがまだ無いため、スキップされました:");
  missingMarkerFiles.forEach((f) => console.warn("  - " + f));
}
console.log(`\n合計 ${changedCount} 箇所を更新しました。`);
