const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const docsDir = path.join(root, "docs");
const siteUrl = "https://dolphintab.xyz";

const requiredPages = [
  "index.html",
  "tab-audio-recorder/index.html",
  "record-audio-from-website/index.html",
  "zh/index.html",
  "support/index.html",
  "privacy/index.html",
];

const requiredAssets = [
  "assets/site.css",
  "assets/favicon-32.png",
  "assets/dolphin-logo-128.png",
  "assets/dolphin-recording-1280x800.png",
  "assets/dolphin-trim-1280x800.png",
  "assets/dolphin-promo-440x280.png",
  "sitemap.xml",
  "robots.txt",
  "CNAME",
  ".nojekyll",
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const file of requiredPages.concat(requiredAssets)) {
  if (!fs.existsSync(path.join(docsDir, file))) {
    fail(`Missing site file: docs/${file}`);
  }
}

for (const page of requiredPages) {
  const html = fs.readFileSync(path.join(docsDir, page), "utf8");
  for (const required of [
    "<title>",
    'name="description"',
    'rel="canonical"',
    'property="og:title"',
    'name="twitter:card"',
    'rel="alternate" hreflang="zh-Hans"',
    'type="application/ld+json"',
    "data-track=",
    "<h1>",
  ]) {
    if (!html.includes(required)) {
      fail(`docs/${page} is missing ${required}`);
    }
  }

  const expectedCta = page === "zh/index.html" ? "安装 Chrome 插件" : "Add to Chrome";
  if (!html.includes(expectedCta)) {
    fail(`docs/${page} is missing CTA text: ${expectedCta}`);
  }

  const h1Count = (html.match(/<h1>/g) || []).length;
  if (h1Count !== 1) {
    fail(`docs/${page} must contain exactly one h1. Found ${h1Count}.`);
  }

  if (/letter-spacing:\s*-[0-9.]/.test(html)) {
    fail(`docs/${page} contains negative letter spacing.`);
  }
}

for (const stalePage of [
  "chrome-audio-recorder/index.html",
  "browser-audio-recorder/index.html",
  "record-webinar-audio/index.html",
]) {
  if (fs.existsSync(path.join(docsDir, stalePage))) {
    fail(`Stale first-draft page should be removed: docs/${stalePage}`);
  }
}

const sitemap = fs.readFileSync(path.join(docsDir, "sitemap.xml"), "utf8");
for (const page of requiredPages) {
  const urlPath =
    page === "index.html" ? "/" : `/${page.replace(/index\.html$/, "")}`;
  if (!sitemap.includes(`${siteUrl}${urlPath}`)) {
    fail(`sitemap.xml missing ${urlPath}`);
  }
}

for (const staleUrl of [
  "/chrome-audio-recorder/",
  "/browser-audio-recorder/",
  "/record-webinar-audio/",
]) {
  if (sitemap.includes(`${siteUrl}${staleUrl}`)) {
    fail(`sitemap.xml still includes stale URL ${staleUrl}`);
  }
}

const robots = fs.readFileSync(path.join(docsDir, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  fail("robots.txt is missing sitemap URL.");
}

const cname = fs.readFileSync(path.join(docsDir, "CNAME"), "utf8").trim();
if (cname !== "dolphintab.xyz") {
  fail(`CNAME must be dolphintab.xyz. Found ${cname}`);
}

console.log("Static SEO site verified.");
