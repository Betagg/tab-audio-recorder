# Tab Audio Recorder

Record audio from the current Chrome tab and save it directly as an MP3.

No screen recording. No video files. No uploads. No accounts.

## Install for Development

1. Run `npm install`.
2. Run `npm run sync-vendor`.
3. Run `npm run generate-icons` if the logo source changes.
4. Open `chrome://extensions`.
5. Enable Developer mode.
6. Click Load unpacked.
7. Select the `extension` folder.

## Use

1. Open a tab that is playing audio.
2. Click the Tab Audio Recorder extension.
3. Click Start Recording.
4. Pause, resume, or stop when needed.
5. Adjust the keep segment if you only want part of the recording.
6. Edit the suggested filename.
7. Click Save MP3.
8. Use the clock button to open the history sidebar and revisit source URLs.

The default Chrome-focused recording toggle shortcut is `Ctrl+Shift+Y` on
Windows/Linux and `Command+Shift+Y` on macOS. A global computer shortcut is also
available as `Ctrl+Shift+8`, so recording can be started, paused, or resumed
even when Chrome is not focused. Shortcuts can be changed at
`chrome://extensions/shortcuts`.

## Product Scope

- Records current browser tab audio only.
- Keeps playback audible while recording.
- Shows a red `REC` toolbar badge while recording and a yellow `PAU` badge while paused.
- Supports both Chrome-focused and global computer keyboard shortcuts.
- Encodes MP3 locally in the extension with `lamejs`.
- Lets users trim the saved segment before downloading.
- Downloads through `chrome.downloads`.
- Keeps a local history of recent saved recordings with source URLs.
- Stores no account data and sends no recordings to any server.

## History

After a recording is saved, the extension stores a lightweight local history entry with:

- Page title.
- Source URL.
- Website host.
- Recording category.
- Save time.
- Duration.
- MP3 filename.

History is available from the small clock button in the popup header. Entries are stored in the extension's IndexedDB, limited to the latest 50 saved recordings, and never uploaded.

## Recognition

The extension classifies each recording locally before recording starts. It uses:

- The active tab URL and domain.
- Page title and source site.
- Public page metadata such as description, Open Graph type, and JSON-LD type.
- Visible headings.
- Whether the page contains audio or video elements.

The classifier returns a category, confidence score, and reason. This helps distinguish cases that were previously easy to mislabel, such as YouTube lectures, YouTube podcasts, Spotify podcast episodes, and Spotify music tracks.

## Visual Direction

The popup uses a compact recorder-console layout inspired by polished audio recorder UI references: a strong brand mark, a dark waveform/timer surface, restrained neutral chrome, and one warm recording accent. The logo is a bright blue field with a clean white dolphin silhouette, echoing simple app-mark systems that stay readable at Chrome toolbar sizes.

## Notes

Chrome's native recorder does not reliably export MP3, so this MVP records PCM audio from the captured tab and encodes MP3 in the offscreen document. This keeps the product promise while avoiding a heavy FFmpeg bundle for the first version.

Some protected streams or sites may block capture. Chrome may also require the user to interact with the tab before audio can be captured.

The bundled MP3 encoder is `lamejs`; its license is included at `extension/vendor/lamejs-LICENSE`.

The `scripting` permission is used only to read lightweight metadata from the active page after the user clicks Start Recording. No page content, recording, or metadata is uploaded.
