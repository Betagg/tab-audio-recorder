const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const requiredFiles = [
  "extension/manifest.json",
  "extension/assets/icon.svg",
  "extension/assets/icon-16.png",
  "extension/assets/icon-32.png",
  "extension/assets/icon-48.png",
  "extension/assets/icon-128.png",
  "extension/classifier.js",
  "extension/popup.html",
  "extension/popup.css",
  "extension/popup.js",
  "extension/background.js",
  "extension/offscreen.html",
  "extension/offscreen.js",
  "extension/vendor/lame.min.js",
];

const missing = requiredFiles.filter((file) => {
  return !fs.existsSync(path.join(root, file));
});

if (missing.length > 0) {
  console.error("Missing required files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8")
);

if (manifest.manifest_version !== 3) {
  console.error("manifest.json must use Manifest V3.");
  process.exit(1);
}

for (const permission of ["activeTab", "tabCapture", "offscreen", "downloads", "scripting"]) {
  if (!manifest.permissions.includes(permission)) {
    console.error(`Missing permission: ${permission}`);
    process.exit(1);
  }
}

if (manifest.permissions.includes("tabs")) {
  console.error("The tabs permission should not be requested for store submission.");
  process.exit(1);
}

const command = manifest.commands?.["toggle-recording"];
if (!command?.suggested_key?.default || !command?.description) {
  console.error("Missing toggle-recording command shortcut.");
  process.exit(1);
}

const globalCommand = manifest.commands?.["global-toggle-recording"];
if (
  !globalCommand?.suggested_key?.default ||
  !globalCommand?.description ||
  globalCommand.global !== true
) {
  console.error("Missing global-toggle-recording command shortcut.");
  process.exit(1);
}

if (!/^Ctrl\+Shift\+[0-9]$/.test(globalCommand.suggested_key.default)) {
  console.error("Global command shortcut must use Ctrl+Shift+[0..9].");
  process.exit(1);
}

console.log("Extension files verified.");
