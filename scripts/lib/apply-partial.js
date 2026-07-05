const fs = require("fs");

function applyPartial(filePath, markerName, partialContent) {
  const startTag = `<!-- PARTIAL:${markerName}:START -->`;
  const endTag = `<!-- PARTIAL:${markerName}:END -->`;
  const original = fs.readFileSync(filePath, "utf-8");

  const startIdx = original.indexOf(startTag);
  const endIdx = original.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1) {
    return { changed: false, reason: "marker_not_found" };
  }

  const before = original.slice(0, startIdx + startTag.length);
  const after = original.slice(endIdx);
  const next = before + "\n" + partialContent.trim() + "\n" + after;

  if (next === original) return { changed: false, reason: "no_diff" };
  fs.writeFileSync(filePath, next, "utf-8");
  return { changed: true };
}

module.exports = { applyPartial };
