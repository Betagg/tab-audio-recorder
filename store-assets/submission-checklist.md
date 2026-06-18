# Chrome Web Store Submission Checklist

## Upload Package

Use this ZIP file:

`/Users/shenjiwei/Documents/Tap record/dist/tab-audio-recorder-v0.1.0-20260618-171902.zip`

The ZIP has `manifest.json` at the archive root and excludes `.DS_Store`.

## Required Assets

- Store icon: `/Users/shenjiwei/Documents/Tap record/extension/assets/icon-128.png`
- Screenshot: `/Users/shenjiwei/Documents/Tap record/store-assets/screenshot-1280x800.png`
- Small promo tile: `/Users/shenjiwei/Documents/Tap record/store-assets/small-promo-440x280.png`

Optional:

- Listing copy: `/Users/shenjiwei/Documents/Tap record/store-assets/listing-copy.md`
- Privacy policy draft: `/Users/shenjiwei/Documents/Tap record/store-assets/privacy-policy.md`
- Public privacy policy page: `https://betagg.github.io/tab-audio-recorder/privacy/`

## Dashboard Steps

1. Open Chrome Web Store Developer Dashboard.
2. Click Add new item.
3. Upload the ZIP package.
4. Fill Store Listing:
   - Product name: Tab Audio Recorder
   - Category: Productivity
   - Language: English
   - Detailed description: copy from `listing-copy.md`
   - Upload icon, screenshot, and small promo tile.
5. Fill Privacy:
   - Single purpose: Record audio from the active browser tab and save it locally as an MP3 file.
   - User data category: Website content, because the extension captures active-tab audio and reads active-tab title/URL metadata after user action.
   - Privacy Policy URL: `https://betagg.github.io/tab-audio-recorder/privacy/`
   - Remote code: No remote code is used.
   - Data use: local-only; no sale, transfer, advertising, creditworthiness, or remote processing.
6. Fill Distribution:
   - Visibility: Public or Unlisted.
   - Pricing: Free.
   - Regions: all regions unless there is a launch constraint.
7. Fill Test Instructions:
   - Copy from `listing-copy.md`.
8. Submit for Review.

## Current Blockers

- A registered Chrome Web Store developer account is required.
- GitHub repository `betagg/tab-audio-recorder` must be created or made accessible to the current Git credentials. The latest check returned `Repository not found`.
- GitHub Pages must be enabled for `betagg/tab-audio-recorder` from the `main` branch `/docs` directory before the privacy URL is public.
- Final submission requires access to the user's Google account and explicit confirmation in the dashboard.
