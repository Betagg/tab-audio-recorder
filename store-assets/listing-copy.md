# Chrome Web Store Listing Draft

## Product Name

Tab Audio Recorder

## Short Description

Record audio from the current browser tab and save it locally as an MP3.

## Detailed Description

Tab Audio Recorder is the fastest way to save audio from a browser tab.

Record podcasts, lessons, webinars, meetings, videos, and other tab audio without recording your screen. The extension captures audio from the active tab only after you start recording, keeps playback audible, and saves the result as a local MP3 file.

Core features:

- Record current tab audio.
- Pause, resume, and stop at any time.
- Trim the keep segment before saving.
- Export directly as MP3.
- Edit the suggested filename before saving.
- Generate clean filenames from the page title and date.
- Keep a local history of saved recordings with source URLs.
- Use a toolbar REC badge while recording.
- Toggle recording with a Chrome shortcut or a global computer shortcut.

Privacy:

Everything runs locally in Chrome. No uploads, no accounts, no analytics, no tracking, and no microphone capture.

## Category

Productivity

## Language

English

## Website Content / Permission Justification

Tab Audio Recorder uses tab capture to record audio from the active browser tab after the user starts recording. It uses activeTab and scripting only after user action to read lightweight metadata from the active tab, such as title and URL, for MP3 filename suggestions and local recording history. Audio and metadata stay on the user's device.

Permission justifications:

- activeTab: Access the current tab after the user starts recording.
- tabCapture: Capture audio from the active browser tab.
- scripting: Read lightweight metadata from the active tab after user action.
- offscreen: Keep local recording and MP3 encoding running in an offscreen document.
- downloads: Save the generated MP3 through Chrome's download manager.

Remote code:

No remote code is used. All JavaScript and the MP3 encoder are bundled with the extension.

Privacy Policy URL:

https://betagg.github.io/tab-audio-recorder/privacy/

## Single Purpose

Record audio from the active browser tab and save it locally as an MP3 file.

## Privacy Practices Draft

Data usage:

- Audio recordings are processed locally and downloaded by the user.
- Page title, source URL, website host, recording duration, save time, and filename are stored locally only for recording history.
- No data is sold, transferred, uploaded, used for advertising, or used for creditworthiness.

User data categories likely to declare:

- Website content: used only for active-tab audio capture and local filename/history metadata.

Limited use certifications:

- Data is not sold or transferred.
- Data is not used for advertising.
- Data is not used for creditworthiness or lending purposes.
- Data is handled locally for the single purpose of recording tab audio and saving MP3 files.

## Test Instructions

1. Load the extension.
2. Open a tab with playable audio, such as a video or podcast page.
3. Click the extension icon.
4. Click Start Recording.
5. Let the tab play audio for a few seconds.
6. Pause, resume, and stop the recording.
7. Adjust the keep segment and preview it if desired.
8. Edit the filename if desired.
9. Click Save MP3 and confirm that an MP3 file downloads.
10. Open the history drawer and confirm that the source URL is listed.

No test account is required.
