const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const docsDir = path.join(root, "docs");
const siteUrl = "https://dolphintab.xyz";
const chromeStoreUrl =
  "https://chromewebstore.google.com/detail/dolphin-tab-audio-recorde/idobmddfgnpambpaaaejbdhipholhjlh?utm_source=website&utm_medium=cta&utm_campaign=seo_site";
const updatedAt = "2026-07-11";

const firstLaunchPages = [
  "index.html",
  "tab-audio-recorder/index.html",
  "record-audio-from-website/index.html",
  "privacy/index.html",
  "support/index.html",
];

const stalePageDirs = [
  "chrome-audio-recorder",
  "browser-audio-recorder",
  "record-webinar-audio",
];

const customDomain = "dolphintab.xyz";

const navLinks = [
  ["/", "Chrome Audio Recorder"],
  ["/tab-audio-recorder/", "Tab Audio Recorder"],
  ["/record-audio-from-website/", "Record Website Audio"],
  ["/zh/", "中文"],
  ["/privacy/", "Privacy"],
  ["/support/", "Support"],
];

const zhNavLabels = new Map([
  ["/", "英文首页"],
  ["/tab-audio-recorder/", "标签页录音"],
  ["/record-audio-from-website/", "网页音频录制"],
  ["/zh/", "中文"],
  ["/privacy/", "隐私"],
  ["/support/", "支持"],
]);

const productFaq = [
  {
    q: "Can I record audio from a Chrome tab?",
    a: "Yes. Dolphin captures audio playing in the active Chrome tab after you start recording.",
  },
  {
    q: "Is Dolphin an audio recorder for Chrome?",
    a: "Yes. Dolphin is a focused Chrome audio recorder for saving current-tab audio as a local MP3 file.",
  },
  {
    q: "Does Dolphin record my screen?",
    a: "No. Dolphin is not a screen recorder. It records tab audio only and does not create video files.",
  },
  {
    q: "Does Dolphin upload my audio?",
    a: "No. Recordings are processed locally in Chrome and downloaded to your device.",
  },
  {
    q: "What format does Dolphin export?",
    a: "Dolphin currently exports MP3 files. WAV is a useful editing format, but it is not part of the current extension release.",
  },
  {
    q: "Does it record microphone or system audio?",
    a: "No. Dolphin records audio from the active browser tab. It does not capture your microphone or full system audio.",
  },
  {
    q: "Can Dolphin record protected or DRM-based streams?",
    a: "Dolphin is designed for audio you have the right to capture. Some protected or DRM-based content may not be recordable.",
  },
  {
    q: "Is Dolphin free to use?",
    a: "Dolphin includes a free monthly recording allowance. Extra access can be unlocked with an invite code or lifetime access when available.",
  },
];

const pages = [
  {
    path: "index.html",
    url: "/",
    title: "Dolphin Tab Audio Recorder - Record Chrome Tab Audio as MP3",
    description:
      "Record audio from any Chrome tab with Dolphin. Save browser audio locally as MP3 with no uploads, no account, and no screen recorder.",
    h1: "Record Chrome Tab Audio",
    kicker: "Tab audio recorder",
    subcopy:
      "Save browser audio as a local MP3. No screen recording, uploads, or setup.",
    image: "/assets/dolphin-recording-1280x800.png",
    imageAlt:
      "Dolphin Chrome audio recorder popup recording current tab audio",
    trust: [
      "Current tab audio",
      "Local MP3",
      "No uploads",
    ],
    sections: [
      {
        id: "how-it-works",
        label: "How it works",
        title: "Open a tab, start recording, export MP3",
        steps: [
          [
            "Open the Chrome tab",
            "Play the lecture, webinar, podcast, web player, or website audio you want to keep.",
          ],
          [
            "Start Dolphin",
            "Click the extension and record audio from the active tab while you listen normally.",
          ],
          [
            "Save the useful part",
            "Stop recording, trim the segment if needed, and download a local MP3 file.",
          ],
        ],
      },
      {
        label: "Why not screen recording",
        title: "Audio-only recording keeps the file and workflow lighter",
        body: [
          "Screen recorders are useful when you need video. But if the task is only to save Chrome tab audio, they add extra steps: record video, export a large file, convert it to audio, then rename it.",
          "Dolphin focuses on the smaller job: record Chrome audio from one tab and save it as a clean local audio file.",
        ],
      },
      {
        label: "Use cases",
        title: "Built around the task: useful browser audio you want to save",
        cards: [
          [
            "Lectures and online courses",
            "Save spoken lessons, language material, and learning clips for later review.",
          ],
          [
            "Podcasts and interviews",
            "Capture reference audio from browser players when you have permission to save it.",
          ],
          [
            "QA and developer capture",
            "Record website audio behavior for testing, documentation, and reproducible reports.",
          ],
          [
            "Web-player audio",
            "Keep useful temporary browser audio without setting up desktop recording software.",
          ],
        ],
      },
      {
        label: "Format",
        title: "MP3 export today, with clear expectations",
        formatComparison: true,
      },
      {
        label: "Editing",
        title: "Trim the useful part before downloading",
        body: [
          "After recording, Dolphin shows a waveform so you can keep the part that matters and skip the extra silence at the beginning or end.",
          "Move the trim handles, preview from the new start point, then save the final MP3. It is meant for quick cleanup, not heavy audio production.",
        ],
        featureSplit: {
          image: "/assets/dolphin-trim-1280x800.png",
          alt: "Dolphin waveform trim editor for choosing the useful audio segment",
          items: [
            ["Waveform view", "Use the visible audio shape to find the right cut point."],
            ["Preview after trim", "Adjust the segment and hear the kept section before saving."],
            ["No separate editor", "Avoid downloading a long file just to cut it somewhere else."],
          ],
        },
      },
      {
        label: "Shortcuts",
        title: "Start and stop recording faster",
        body: [
          "Use Chrome extension shortcuts when timing matters. Press the shortcut once to start recording the active tab, then press it again to stop.",
          "You can review or change extension shortcuts from Chrome's shortcut settings.",
        ],
        shortcutPanel: true,
      },
      {
        label: "Pricing",
        title: "Free monthly use, then unlock when Dolphin becomes useful",
        body: [
          "Dolphin includes 5 free recordings each month. If you need more, unlock the current device with an invite code or choose lifetime access.",
        ],
        pricingPanel: true,
      },
      {
        label: "History",
        title: "Find the source page again after saving",
        body: [
          "Dolphin keeps a local recording history with the page title, source URL, duration, filename, and save time. It helps you return to the original lecture, webinar, interview, or web player later.",
        ],
        cards: [
          [
            "Source URL",
            "Keep the page link beside the recording so the context does not disappear.",
          ],
          [
            "Page title",
            "Use the original page title as a practical memory cue.",
          ],
          [
            "Local history",
            "History metadata stays on your device and is not uploaded by the extension.",
          ],
          [
            "Faster follow-up",
            "Revisit the source page when you need notes, citations, or the next lesson.",
          ],
        ],
      },
      {
        label: "Privacy",
        title: "Local recording, no audio uploads",
        body: [
          "Dolphin records and encodes tab audio locally in Chrome. Your recordings are downloaded to your device and are not uploaded by the extension.",
          "The extension uses Chrome permissions for the active tab, tab audio capture, downloads, and an offscreen recording document. It does not capture your microphone.",
        ],
        link: ["/privacy/", "Read about local recording and privacy"],
      },
    ],
    faq: productFaq,
    schema: ["SoftwareApplication", "FAQPage"],
  },
  {
    path: "tab-audio-recorder/index.html",
    url: "/tab-audio-recorder/",
    title: "Tab Audio Recorder for Chrome - Capture Sound From One Browser Tab",
    description:
      "Use Dolphin as a tab audio recorder for Chrome. Capture sound from the current browser tab and save it locally as MP3.",
    h1: "Tab Audio Recorder for Chrome",
    kicker: "Tab audio recorder",
    subcopy:
      "Use Dolphin when you need to record audio from one Chrome tab, not your microphone, desktop, or whole screen.",
    image: "/assets/dolphin-trim-1280x800.png",
    imageAlt:
      "Dolphin tab audio recorder waveform editor before saving MP3",
    trust: [
      "Records one active tab",
      "Waveform trim before saving",
      "Local MP3 download",
    ],
    sections: [
      {
        label: "Definition",
        title: "What is a tab audio recorder?",
        body: [
          "A tab audio recorder captures sound from a specific browser tab. That is different from a voice recorder, a system audio recorder, or a screen recorder.",
          "Dolphin is made for the moment when you hear useful audio in Chrome and want a clean local file without setting up OBS, QuickTime, Audacity, or a virtual audio route.",
        ],
      },
      {
        id: "how-it-works",
        label: "Workflow",
        title: "How to record tab audio in Chrome",
        steps: [
          [
            "Open the tab with audio",
            "Make sure the tab is playing audible sound and is not muted.",
          ],
          [
            "Start recording",
            "Click Dolphin from the Chrome toolbar and start capturing the current tab.",
          ],
          [
            "Stop and save",
            "Trim the useful segment and save the recording as an MP3 file.",
          ],
        ],
      },
      {
        label: "Features",
        title: "Focused features for Chrome tab audio",
        cards: [
          [
            "Current-tab capture",
            "Record audio from the tab you choose instead of capturing your whole desktop.",
          ],
          [
            "Pause, resume, stop",
            "Control the recording when timing matters.",
          ],
          [
            "Waveform trim",
            "Keep the important part before downloading.",
          ],
          [
            "Smart filenames",
            "Use page title and date hints so recordings are easier to find.",
          ],
        ],
      },
      {
        label: "Keyboard control",
        title: "A shortcut for moments that start suddenly",
        body: [
          "Dolphin supports a Chrome extension shortcut so you can start and stop recording without opening the popup first.",
          "On Mac and Windows, open Chrome extension shortcuts and assign the key combination that feels fastest for your workflow.",
        ],
        shortcutPanel: true,
      },
      {
        label: "Privacy",
        title: "The audio does not leave your browser",
        body: [
          "Dolphin processes recordings locally and saves files through Chrome downloads. It does not upload recording audio, page titles, URLs, filenames, or local history.",
        ],
        link: ["/privacy/", "Learn more about Dolphin privacy"],
      },
    ],
    faq: [
      {
        q: "Can Dolphin record only one tab?",
        a: "Yes. Dolphin is designed to capture the active Chrome tab after you start recording.",
      },
      {
        q: "Can I save the recording as MP3 or WAV?",
        a: "Dolphin currently saves recordings as MP3 files. WAV export is not included in the current release.",
      },
      {
        q: "Does the audio leave my browser?",
        a: "No. Recordings are processed locally in Chrome and downloaded to your device.",
      },
      {
        q: "What if the tab is muted?",
        a: "If the tab is muted or not playing audible audio, the recording may be silent. Unmute the tab before recording.",
      },
      {
        q: "Can it record long sessions?",
        a: "Dolphin is designed for practical browser audio sessions, but very long recordings depend on Chrome, memory, and device performance.",
      },
      {
        q: "Does it also record microphone or system audio?",
        a: "No. Dolphin records the active tab audio only. It is not a microphone or full system audio recorder.",
      },
    ],
    schema: ["SoftwareApplication", "FAQPage", "BreadcrumbList"],
  },
  {
    path: "record-audio-from-website/index.html",
    url: "/record-audio-from-website/",
    title: "How to Record Audio From a Website in Chrome",
    description:
      "Learn how to record audio from a website in Chrome with Dolphin. Capture website audio from the active tab and save it locally as MP3.",
    h1: "How to Record Audio From a Website",
    kicker: "How-to guide",
    subcopy:
      "If a website plays useful audio but has no download button, Dolphin gives you a simple Chrome extension workflow for saving allowed browser audio locally.",
    image: "/assets/dolphin-recording-1280x800.png",
    imageAlt:
      "Recording audio from a website in Chrome with Dolphin",
    trust: [
      "Works from the active tab",
      "No desktop audio routing",
      "Exports local MP3",
    ],
    sections: [
      {
        id: "how-it-works",
        label: "Step-by-step",
        title: "How to record audio from a website",
        steps: [
          [
            "Install Dolphin from the Chrome Web Store",
            "Add the extension to Chrome and pin it so the recorder is easy to open.",
          ],
          [
            "Open the website tab with the audio",
            "Play the course, webinar, podcast, radio stream, or web player audio you need to capture.",
          ],
          [
            "Click Dolphin and start recording",
            "Dolphin captures audio from the active tab while you continue listening normally.",
          ],
          [
            "Stop recording when finished",
            "Stop when the useful part is done, or trim the segment with the waveform view.",
          ],
          [
            "Save the file as MP3",
            "Edit the filename and download the recording to your device through Chrome downloads.",
          ],
        ],
      },
      {
        label: "Best fit",
        title: "When this works best",
        body: [
          "Dolphin is a good fit for spoken-word website audio: online lectures, webinars, interviews, podcasts, language learning material, QA captures, and web-player clips.",
          "It is not designed to bypass protected streams or DRM. Some protected content may not be recordable.",
        ],
      },
      {
        label: "Troubleshooting",
        title: "If there is no sound in the recording",
        cards: [
          [
            "Check the active tab",
            "Start recording from the tab that is actually playing audio.",
          ],
          [
            "Unmute the tab",
            "A muted Chrome tab or silent website player may create a silent recording.",
          ],
          [
            "Allow capture",
            "Chrome may require tab capture permission before audio recording starts.",
          ],
          [
            "Protected content",
            "DRM-based or protected audio may not be available to browser tab capture.",
          ],
        ],
      },
      {
        label: "Legal and privacy note",
        title: "Record audio you have the right to capture",
        body: [
          "Dolphin is designed for recording audio you have the right to capture. Always respect copyright and the source website's terms.",
          "Recordings are processed locally by the extension and downloaded to your device.",
        ],
      },
    ],
    faq: [
      {
        q: "How do I record audio from a website in Chrome?",
        a: "Install Dolphin, open the website tab with audio, start recording from the extension, stop when finished, and save the local MP3 file.",
      },
      {
        q: "Can Dolphin record audio from any website?",
        a: "Dolphin works with many websites that play audible tab audio, but it cannot guarantee capture from every site. Protected or DRM-based content may not be recordable.",
      },
      {
        q: "Do I need OBS, Audacity, QuickTime, or a virtual audio cable?",
        a: "No. Dolphin is a Chrome extension workflow for active-tab audio, so you do not need desktop audio routing for supported browser audio.",
      },
      {
        q: "Can I save website audio as WAV?",
        a: "The current release saves MP3. WAV export is not included yet.",
      },
      {
        q: "Is my website audio uploaded?",
        a: "No. Recording and MP3 encoding run locally in Chrome.",
      },
    ],
    schema: ["HowTo", "FAQPage", "BreadcrumbList"],
  },
  {
    path: "privacy/index.html",
    url: "/privacy/",
    title: "Dolphin Privacy - Local Chrome Tab Audio Recording",
    description:
      "Learn how Dolphin handles Chrome tab audio recording, local files, browser permissions, and privacy.",
    h1: "Privacy And Local Recording",
    kicker: "Privacy",
    subcopy:
      "Dolphin is built for local tab audio recording. Recordings are saved on your device and are not uploaded by the extension.",
    noImage: true,
    trust: [
      "Local tab audio recording",
      "No recording uploads",
      "No microphone capture",
    ],
    sections: [
      {
        label: "What audio is recorded",
        title: "Only the active Chrome tab after you start recording",
        body: [
          "Dolphin captures audio from the active browser tab after you start recording. It does not capture microphone audio and does not record your whole screen.",
        ],
      },
      {
        label: "Where recordings are stored",
        title: "Recordings are saved on your device",
        body: [
          "Audio is encoded locally and downloaded through Chrome's download manager. Local recording history may store lightweight metadata such as page title, source URL, host, duration, save time, and filename.",
        ],
      },
      {
        label: "Uploads",
        title: "Dolphin does not upload recordings",
        body: [
          "Recordings, page URLs, page titles, filenames, and recording history are not uploaded by the extension.",
          "Invite code activation and lifetime purchase checks use a small licensing API. Those requests use a random extension-install device ID, invite or checkout status, and extension version. They are not used to upload recording audio.",
        ],
      },
      {
        label: "Permissions",
        title: "Why Chrome permissions are needed",
        cards: [
          [
            "tabCapture",
            "Captures audio from the active Chrome tab after you start recording.",
          ],
          [
            "activeTab and scripting",
            "Reads lightweight page metadata after user action for filenames and local history.",
          ],
          [
            "offscreen",
            "Keeps recording and MP3 encoding running while the popup is closed.",
          ],
          [
            "downloads",
            "Saves the generated MP3 through Chrome downloads.",
          ],
        ],
      },
      {
        label: "Contact",
        title: "Support and privacy questions",
        body: [
          "For support or privacy questions, use the support contact provided on the Chrome Web Store listing.",
        ],
        link: ["/support/", "Open Dolphin support"],
      },
    ],
    faq: [],
    schema: ["SoftwareApplication", "BreadcrumbList"],
  },
  {
    path: "support/index.html",
    url: "/support/",
    title: "Dolphin Support - Chrome Tab Audio Recording Help",
    description:
      "Get help with Dolphin Tab Audio Recorder, including no sound, export issues, Chrome permissions, muted tabs, and protected content.",
    h1: "Support",
    kicker: "Dolphin support",
    subcopy:
      "Troubleshooting help for recording Chrome tab audio and saving local MP3 files.",
    image: "/assets/dolphin-promo-440x280.png",
    imageAlt: "Dolphin Tab Audio Recorder promotional card",
    imageWidth: 440,
    imageHeight: 280,
    trust: [
      "No-sound checklist",
      "Chrome permission help",
      "Export troubleshooting",
    ],
    sections: [
      {
        label: "No sound",
        title: "No sound in recording",
        body: [
          "Make sure the tab is playing audible audio and is not muted. Start recording from the active tab that contains the audio.",
          "If the website switches players or reloads, stop the recording and start again from the current tab.",
        ],
      },
      {
        label: "Recording stops",
        title: "Recording stops unexpectedly",
        body: [
          "Very long recordings depend on Chrome, memory, and device performance. If a recording stops, save the current file and start a new session.",
        ],
      },
      {
        label: "Export",
        title: "MP3 export issues",
        body: [
          "Dolphin exports MP3 files through Chrome downloads. If the file does not appear, check Chrome download settings and whether the browser blocked downloads from the extension.",
        ],
      },
      {
        label: "Permissions",
        title: "Chrome permission issue",
        body: [
          "Dolphin needs permission to capture the active tab audio after you start recording. Reload the page and start again if Chrome permission prompts were dismissed.",
        ],
      },
      {
        label: "Protected content",
        title: "Can Dolphin record protected content?",
        body: [
          "Dolphin is designed for audio you have the right to capture. Some protected or DRM-based content may not be recordable.",
        ],
      },
    ],
    faq: [
      {
        q: "Why is my tab audio recording silent?",
        a: "The tab may be muted, the website player may be silent, or recording may have started from the wrong tab.",
      },
      {
        q: "Why did recording stop?",
        a: "Long recordings can be affected by browser memory, device performance, or tab reloads.",
      },
      {
        q: "Can I change Chrome shortcuts?",
        a: "Chrome lets users manage extension shortcuts from chrome://extensions/shortcuts.",
      },
      {
        q: "How do I contact support?",
        a: "Use the support contact listed on the Chrome Web Store page for Dolphin Tab Audio Recorder.",
      },
    ],
    schema: ["FAQPage", "BreadcrumbList"],
  },
  {
    path: "zh/index.html",
    url: "/zh/",
    lang: "zh-Hans",
    title: "Dolphin Tab Audio Recorder - 录制 Chrome 标签页音频并保存为 MP3",
    description:
      "Dolphin 可以录制当前 Chrome 标签页的声音，并在本地保存为 MP3。无需录屏、无需上传、无需账号。",
    h1: "录制 Chrome 标签页里的声音",
    kicker: "Chrome 标签页录音工具",
    subcopy:
      "当你只想保存网页里的音频时，Dolphin 可以直接录制当前标签页声音，剪掉不需要的片段，然后下载本地 MP3。",
    image: "/assets/dolphin-recording-1280x800.png",
    imageAlt: "Dolphin Chrome 标签页录音插件正在录制当前标签页声音",
    trust: ["当前标签页录音", "本地保存 MP3", "不录屏、不上传"],
    sections: [
      {
        id: "how-it-works",
        label: "使用流程",
        title: "打开网页，开始录制，保存 MP3",
        steps: [
          ["打开有声音的标签页", "播放课程、播客、访谈、网页播放器或其他你有权保存的音频。"],
          ["点击 Dolphin 开始录制", "插件只捕捉当前标签页的声音，你可以正常继续收听。"],
          ["剪辑并保存", "录完后通过音波选择要保留的片段，再下载为 MP3。"],
        ],
      },
      {
        label: "适合场景",
        title: "适合学习、研究和网页音频保存",
        cards: [
          ["在线课程", "保存 lecture、语言学习材料、课程回放中的重点音频。"],
          ["研究素材", "留存访谈、webinar、专家讨论和网页播放器里的参考音频。"],
          ["内容创作", "收集播客片段、参考音频和网页声音素材，便于后续整理。"],
          ["问题复现", "记录网页音频问题，方便 QA、产品和开发沟通。"],
        ],
      },
      {
        label: "剪辑",
        title: "保存前先选出真正需要的那一段",
        body: [
          "录制完成后，Dolphin 会显示音波。你可以拖动两端的选择范围，预览保留片段，再保存最终 MP3。",
        ],
        featureSplit: {
          image: "/assets/dolphin-trim-1280x800.png",
          alt: "Dolphin 音波剪辑界面",
          items: [
            ["音波判断", "通过波形更容易判断从哪里开始剪。"],
            ["调整后预览", "拖动范围后直接从新的开头预览。"],
            ["减少二次剪辑", "不用先下载长文件再打开其他软件处理。"],
          ],
        },
      },
      {
        label: "快捷键",
        title: "用快捷键更快开始和停止",
        body: [
          "你可以在 Chrome 扩展快捷键设置里为 Dolphin 绑定快捷键。按一次开始录制，再按一次停止。",
        ],
        shortcutPanel: true,
      },
      {
        label: "价格",
        title: "每月 5 次免费，觉得有用再解锁",
        body: [
          "Dolphin 每月提供 5 次免费录制。额度用完后，可以输入邀请码解锁当前设备，或选择买断终身使用。",
        ],
        pricingPanel: true,
      },
      {
        label: "历史记录",
        title: "录完以后也能找回来源网页",
        body: [
          "Dolphin 会在本地保存录音历史，包括网页标题、来源 URL、时长、文件名和保存时间。之后想回看课程、webinar、访谈或网页播放器时会更方便。",
        ],
        cards: [
          ["来源链接", "每条录音都能看到当时录制的网址。"],
          ["网页标题", "用原始标题帮助你快速判断录音内容。"],
          ["本地保存", "历史记录只保存在设备上，不上传录音文件。"],
          ["方便回溯", "需要补笔记、找出处或继续学习时更容易返回原页面。"],
        ],
      },
      {
        label: "隐私",
        title: "录音在本地处理，不上传音频",
        body: [
          "Dolphin 在 Chrome 本地录制和编码音频，并通过浏览器下载到你的设备。插件不会上传你的录音文件。",
        ],
        link: ["/privacy/", "查看隐私说明"],
      },
    ],
    faq: [
      {
        q: "Dolphin 会录屏吗？",
        a: "不会。Dolphin 只录制当前 Chrome 标签页的声音，不生成视频文件。",
      },
      {
        q: "录音会上传到服务器吗？",
        a: "不会。录音和 MP3 编码在本地完成，文件保存到你的设备。",
      },
      {
        q: "可以录麦克风或整个电脑声音吗？",
        a: "不可以。Dolphin 专注于当前浏览器标签页音频。",
      },
      {
        q: "可以录所有网站吗？",
        a: "大多数能正常播放标签页声音的网站都可以尝试录制，但受保护或 DRM 内容可能无法录制。",
      },
    ],
    schema: ["SoftwareApplication", "FAQPage", "BreadcrumbList"],
  },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(url) {
  return `${siteUrl}${url === "/" ? "/" : url}`;
}

function relativePrefix(pagePath) {
  const depth = pagePath.split("/").length - 1;
  return depth === 0 ? "" : "../".repeat(depth);
}

function localUrl(url, pagePath) {
  const prefix = relativePrefix(pagePath);
  if (url === "/") {
    return prefix || "./";
  }
  return `${prefix}${url.replace(/^\/|\/$/g, "")}/`;
}

function localAsset(url, pagePath) {
  return `${relativePrefix(pagePath)}${url.replace(/^\//, "")}`;
}

function assetUrl(url) {
  return `${siteUrl}${url}`;
}

function nav(currentUrl, pagePath, lang) {
  const labelMap = lang === "zh-Hans" ? zhNavLabels : null;
  return navLinks
    .map(([href, label]) => {
      const active = href === currentUrl ? ' aria-current="page"' : "";
      return `<a href="${localUrl(href, pagePath)}"${active}>${esc(
        labelMap?.get(href) || label
      )}</a>`;
    })
    .join("");
}

function trackedUrl(source) {
  return `${chromeStoreUrl}&utm_content=${encodeURIComponent(source)}`;
}

function renderTrust(items) {
  return `<ul class="trust-list">${items
    .map((item) => `<li>${esc(item)}</li>`)
    .join("")}</ul>`;
}

function renderSteps(steps) {
  return `<ol class="steps">${steps
    .map(
      ([title, body]) => `<li>
        <span>${esc(title)}</span>
        <p>${esc(body)}</p>
      </li>`
    )
    .join("")}</ol>`;
}

function renderCards(cards) {
  return `<div class="card-grid">${cards
    .map(
      ([title, body]) => `<article class="card">
        <h3>${esc(title)}</h3>
        <p>${esc(body)}</p>
      </article>`
    )
    .join("")}</div>`;
}

function renderFormatComparison() {
  return `<div class="format-grid">
    <article>
      <h3>MP3</h3>
      <p>Best for smaller files, sharing, offline listening, lecture review, and everyday browser audio capture.</p>
      <strong>Current Dolphin export format</strong>
    </article>
    <article>
      <h3>WAV</h3>
      <p>Best for editing workflows and uncompressed audio, but larger and not included in the current release.</p>
      <strong>Not available yet</strong>
    </article>
  </div>`;
}

function renderFeatureSplit(feature, pagePath) {
  return `<div class="feature-split">
    <figure>
      <img src="${localAsset(feature.image, pagePath)}" alt="${esc(feature.alt)}" width="1280" height="800">
    </figure>
    <div class="mini-feature-grid">
      ${feature.items
        .map(
          ([title, body]) => `<article>
            <h3>${esc(title)}</h3>
            <p>${esc(body)}</p>
          </article>`
        )
        .join("")}
    </div>
  </div>`;
}

function renderShortcutPanel(page) {
  const isZh = page.lang === "zh-Hans";
  return `<div class="shortcut-panel">
    <div>
      <span>${isZh ? "推荐设置" : "Recommended setup"}</span>
      <strong>${isZh ? "Chrome 扩展快捷键" : "Chrome extension shortcut"}</strong>
      <p>${isZh ? "在地址栏打开 chrome://extensions/shortcuts，找到 Dolphin，然后设置“开始/停止录制”的快捷键。" : "Open chrome://extensions/shortcuts, find Dolphin, then assign a shortcut for starting and stopping recording."}</p>
    </div>
    <div class="shortcut-keys" aria-label="${isZh ? "快捷键示例" : "Shortcut example"}">
      <kbd>${isZh ? "Mac" : "Mac"}</kbd>
      <span>Command + Shift + Y</span>
      <kbd>${isZh ? "Windows" : "Windows"}</kbd>
      <span>Ctrl + Shift + Y</span>
    </div>
  </div>`;
}

function renderPricingPanel(page) {
  const isZh = page.lang === "zh-Hans";
  return `<div class="pricing-panel">
    <article class="price-card">
      <p>${isZh ? "免费额度" : "Free allowance"}</p>
      <h3>${isZh ? "每月 5 次录制" : "5 recordings per month"}</h3>
      <span>${isZh ? "适合偶尔保存课程、播客和网页音频。" : "Good for occasional lectures, podcasts, and website audio."}</span>
    </article>
    <article class="price-card featured">
      <p>${isZh ? "早鸟买断" : "Early-bird lifetime"}</p>
      <h3><s>$29.90</s> $9.99</h3>
      <span>${isZh ? "当前设备终身使用。后续标准价为 $29.90。" : "Lifetime access on this device. Standard price is $29.90 later."}</span>
    </article>
    <article class="price-card">
      <p>${isZh ? "邀请码" : "Invite code"}</p>
      <h3>${isZh ? "验证后永久免费" : "Permanent unlock"}</h3>
      <span>${isZh ? "邀请码验证成功后，这台设备可持续使用。" : "After activation, this device stays unlocked."}</span>
    </article>
  </div>`;
}

function renderSection(section, page) {
  const pagePath = page.path;
  const link = section.link
    ? `<a class="text-link" data-track="privacy_link_click" href="${localUrl(
        section.link[0],
        pagePath
      )}">${esc(section.link[1])}</a>`
    : "";

  return `<section class="section" ${section.id ? `id="${section.id}"` : ""}>
    <div class="section-head">
      <p class="eyebrow">${esc(section.label)}</p>
      <h2>${esc(section.title)}</h2>
      ${(section.body || []).map((item) => `<p>${esc(item)}</p>`).join("")}
      ${link}
    </div>
    ${section.steps ? renderSteps(section.steps) : ""}
    ${section.cards ? renderCards(section.cards) : ""}
    ${section.formatComparison ? renderFormatComparison() : ""}
    ${section.featureSplit ? renderFeatureSplit(section.featureSplit, pagePath) : ""}
    ${section.shortcutPanel ? renderShortcutPanel(page) : ""}
    ${section.pricingPanel ? renderPricingPanel(page) : ""}
  </section>`;
}

function renderFaq(faq, page = {}) {
  if (!faq.length) return "";
  const isZh = page.lang === "zh-Hans";
  return `<section class="section faq-section">
    <div class="section-head">
      <p class="eyebrow">${isZh ? "常见问题" : "FAQ"}</p>
      <h2>${isZh ? "你可能会关心的问题" : "Common questions"}</h2>
    </div>
    <div class="faq-list">
      ${faq
        .map(
          (item) => `<details data-track="support_question_click">
            <summary>${esc(item.q)}</summary>
            <p>${esc(item.a)}</p>
          </details>`
        )
        .join("")}
    </div>
  </section>`;
}

function breadcrumbSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl + "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.h1,
        item: absoluteUrl(page.url),
      },
    ],
  };
}

function schemaItems(page) {
  const items = [];
  if (page.schema.includes("SoftwareApplication")) {
    items.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Dolphin Tab Audio Recorder",
      applicationCategory: "BrowserApplication",
      operatingSystem: "Chrome",
      browserRequirements: "Chrome browser with extension support",
      description: page.description,
      image: assetUrl(page.image || "/assets/dolphin-logo-128.png"),
      offers: {
        "@type": "Offer",
        price: "9.99",
        priceCurrency: "USD",
      },
    });
  }

  if (page.schema.includes("HowTo")) {
    const stepSection = page.sections.find((section) => section.steps);
    items.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: page.h1,
      description: page.description,
      image: assetUrl(page.image),
      step: (stepSection?.steps || []).map(([name, text]) => ({
        "@type": "HowToStep",
        name,
        text,
      })),
    });
  }

  if (page.schema.includes("FAQPage") && page.faq.length) {
    items.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  }

  if (page.schema.includes("BreadcrumbList") && page.url !== "/") {
    items.push(breadcrumbSchema(page));
  }

  return items
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join("\n");
}

function renderPage(page) {
  const canonical = absoluteUrl(page.url);
  const image = page.image || "/assets/dolphin-logo-128.png";
  const isZh = page.lang === "zh-Hans";
  const pageLang = page.lang || "en";
  const enAlternate = isZh ? `${siteUrl}/` : canonical;
  const ctaText = isZh ? "安装 Chrome 插件" : "Add to Chrome";
  const privacyNote = isZh
    ? "本地录音，不上传。"
    : "Local recording. No uploads.";
  const bottomEyebrow = isZh ? "准备开始录制标签页音频？" : "Ready to record Chrome tab audio?";
  const bottomTitle = isZh
    ? "安装 Dolphin，把有用的网页声音保存为本地 MP3。"
    : "Install Dolphin and save useful browser audio as a local MP3.";
  const footerCopy = isZh
    ? "本地录制 Chrome 标签页音频。不录屏、不上传、不需要复杂音频路由。"
    : "Record Chrome tab audio locally. No screen recorder, no uploads, no audio routing.";
  const heroMedia = page.noImage
    ? `<div class="privacy-card">${renderTrust(page.trust)}</div>`
    : `<figure class="hero-media">
        <img src="${localAsset(image, page.path)}" alt="${esc(page.imageAlt)}" width="${
        page.imageWidth || 1280
      }" height="${page.imageHeight || 800}">
      </figure>`;

  return `<!doctype html>
<html lang="${pageLang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" hreflang="en" href="${enAlternate}">
    <link rel="alternate" hreflang="zh-Hans" href="${siteUrl}/zh/">
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(page.title)}">
    <meta property="og:description" content="${esc(page.description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${assetUrl(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(page.title)}">
    <meta name="twitter:description" content="${esc(page.description)}">
    <meta name="twitter:image" content="${assetUrl(image)}">
    <link rel="icon" type="image/png" sizes="32x32" href="${localAsset("/assets/favicon-32.png", page.path)}">
    <link rel="stylesheet" href="${localAsset("/assets/site.css", page.path)}">
    ${schemaItems(page)}
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${localUrl("/", page.path)}" aria-label="Dolphin Tab Audio Recorder home">
        <img src="${localAsset("/assets/dolphin-logo-128.png", page.path)}" alt="" width="40" height="40">
        <span>Dolphin Tab Audio Recorder</span>
      </a>
      <nav class="site-nav" aria-label="${isZh ? "主导航" : "Primary navigation"}">${nav(page.url, page.path, page.lang)}</nav>
      <a class="nav-cta" data-track="cta_add_to_chrome_click" href="${trackedUrl(
        "header"
      )}">${ctaText}</a>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="kicker">${esc(page.kicker)}</p>
          <h1>${esc(page.h1)}</h1>
          <p class="hero-subcopy">${esc(page.subcopy)}</p>
          <div class="hero-actions">
            <a class="button primary" data-track="cta_add_to_chrome_click" href="${trackedUrl(
              "hero"
            )}">${ctaText}</a>
          </div>
          ${renderTrust(page.trust)}
          <p class="privacy-note">${privacyNote}</p>
        </div>
        ${heroMedia}
      </section>

      ${page.sections.map((section) => renderSection(section, page)).join("\n")}

      <section class="section bottom-cta">
        <div>
          <p class="eyebrow">${bottomEyebrow}</p>
          <h2>${bottomTitle}</h2>
        </div>
        <a class="button primary" data-track="cta_add_to_chrome_click" href="${trackedUrl(
          "bottom"
        )}">${ctaText}</a>
      </section>

      ${renderFaq(page.faq, page)}
    </main>

    <footer class="site-footer">
      <div>
        <a class="brand footer-brand" href="${localUrl("/", page.path)}">
          <img src="${localAsset("/assets/dolphin-logo-128.png", page.path)}" alt="" width="32" height="32">
          <span>Dolphin Tab Audio Recorder</span>
        </a>
        <p>${footerCopy}</p>
      </div>
      <nav aria-label="Footer navigation">
        ${navLinks.map(([href, label]) => `<a href="${localUrl(href, page.path)}">${esc((isZh ? zhNavLabels.get(href) : null) || label)}</a>`).join("")}
      </nav>
    </footer>

    <script>
      (function () {
        function track(name, detail) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: name, detail: detail || {} });
          window.dispatchEvent(new CustomEvent("dolphin_site_event", {
            detail: { event: name, data: detail || {} }
          }));
        }

        document.addEventListener("click", function (event) {
          var target = event.target.closest("[data-track]");
          if (!target) return;
          var eventName = target.getAttribute("data-track");
          track(eventName, {
            text: target.textContent.trim(),
            href: target.getAttribute("href") || "",
            path: window.location.pathname
          });
          if (target.hostname && target.hostname !== window.location.hostname) {
            track("outbound_chrome_webstore_click", {
              href: target.href,
              path: window.location.pathname
            });
          }
        });
      })();
    </script>
  </body>
</html>
`;
}

function writeCss() {
  const css = `:root {
  color-scheme: light;
  --bg: #f6f8fb;
  --surface: #ffffff;
  --ink: #111827;
  --text: #263242;
  --muted: #667085;
  --line: #d8e1ec;
  --soft: #eaf4ff;
  --blue: #4f95e8;
  --blue-strong: #1f73d8;
  --teal: #20b8c8;
  --green: #2ea86f;
  --red: #ef4444;
  --shadow: 0 24px 70px rgba(26, 43, 68, 0.12);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
html:lang(zh-Hans) body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 22px;
  min-height: 72px;
  padding: 14px max(24px, calc((100vw - 1160px) / 2));
  background: rgba(246, 248, 251, 0.9);
  border-bottom: 1px solid rgba(216, 225, 236, 0.84);
  backdrop-filter: blur(16px);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  font-weight: 850;
  white-space: nowrap;
}
.brand img { border-radius: 12px; }
.site-nav {
  display: flex;
  flex: 1;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.site-nav::-webkit-scrollbar { display: none; }
.site-nav a {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 760;
}
.site-nav a:hover,
.site-nav a[aria-current="page"] {
  background: var(--soft);
  color: var(--ink);
}
.nav-cta,
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 18px;
  font-weight: 850;
  white-space: nowrap;
}
.nav-cta,
.button.primary {
  background: linear-gradient(135deg, #ff5a3d, #e42d62);
  color: #fff;
  box-shadow: 0 14px 34px rgba(228, 45, 98, 0.2);
}
.button.secondary {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
}
main {
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 44px;
  align-items: center;
  min-height: calc(100vh - 72px);
  padding: 54px 0 46px;
}
.kicker,
.eyebrow {
  margin: 0 0 12px;
  color: var(--blue-strong);
  font-size: 14px;
  font-weight: 850;
}
h1, h2, h3, p { margin-top: 0; }
h1,
h2,
h3,
.brand,
.button,
.nav-cta {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
html:lang(zh-Hans) h1,
html:lang(zh-Hans) h2,
html:lang(zh-Hans) h3,
html:lang(zh-Hans) .brand,
html:lang(zh-Hans) .button,
html:lang(zh-Hans) .nav-cta {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
h1 {
  max-width: 680px;
  margin-bottom: 18px;
  color: var(--ink);
  font-size: clamp(42px, 5.4vw, 68px);
  line-height: 1;
  font-weight: 860;
}
h2 {
  margin-bottom: 14px;
  color: var(--ink);
  font-size: clamp(30px, 3vw, 46px);
  line-height: 1.05;
  font-weight: 820;
}
h3 {
  margin-bottom: 8px;
  color: var(--ink);
  font-size: 20px;
  line-height: 1.2;
  font-weight: 760;
}
p { color: var(--muted); }
.hero-subcopy {
  max-width: 560px;
  margin-bottom: 24px;
  font-size: 18px;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.trust-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
}
.trust-list li {
  position: relative;
  min-height: 48px;
  display: flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 10px 12px 10px 30px;
  color: var(--ink);
  font-weight: 780;
}
.trust-list li::before {
  content: "";
  position: absolute;
  left: 12px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--teal);
}
.privacy-note {
  margin: 0;
  color: #788497;
  font-size: 13px;
  font-weight: 700;
}
.hero .trust-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.hero .trust-list li {
  min-height: 34px;
  border-radius: 999px;
  padding: 7px 12px 7px 28px;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.1;
}
.hero .trust-list li::before {
  left: 12px;
  width: 7px;
  height: 7px;
}
.hero-media,
.privacy-card {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.hero-media img {
  width: 100%;
  height: auto;
}
.privacy-card {
  padding: 30px;
}
.privacy-card .trust-list {
  grid-template-columns: 1fr;
  margin-bottom: 0;
}
.section {
  padding: 70px 0;
  border-top: 1px solid var(--line);
}
.section-head {
  max-width: 780px;
}
.section-head p {
  font-size: 18px;
}
.text-link {
  display: inline-flex;
  margin-top: 8px;
  color: var(--blue-strong);
  font-weight: 850;
}
.steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}
.steps li {
  counter-increment: step;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 24px;
}
.steps li::before {
  content: counter(step);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-bottom: 16px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--blue-strong);
  font-weight: 900;
}
.steps span {
  display: block;
  margin-bottom: 8px;
  color: var(--ink);
  font-size: 19px;
  font-weight: 850;
}
.steps p { margin-bottom: 0; }
.card-grid,
.format-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 26px;
}
.card,
.format-grid article {
  min-height: 178px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(28, 46, 74, 0.07);
}
.card p,
.format-grid p {
  margin-bottom: 0;
}
.format-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.format-grid strong {
  display: inline-flex;
  margin-top: 16px;
  color: var(--ink);
}
.feature-split {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 18px;
  align-items: stretch;
  margin-top: 28px;
}
.feature-split figure {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.feature-split img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-feature-grid {
  display: grid;
  gap: 12px;
}
.mini-feature-grid article {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 20px;
}
.mini-feature-grid p { margin-bottom: 0; }
.shortcut-panel,
.pricing-panel {
  display: grid;
  gap: 16px;
  margin-top: 28px;
}
.shortcut-panel {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.7fr);
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  padding: 26px;
  box-shadow: 0 16px 40px rgba(28, 46, 74, 0.07);
}
.shortcut-panel span,
.price-card p {
  display: block;
  margin: 0 0 6px;
  color: var(--blue-strong);
  font-size: 13px;
  font-weight: 850;
}
.shortcut-panel strong {
  display: block;
  color: var(--ink);
  font-size: 24px;
  line-height: 1.15;
}
.shortcut-panel p { margin: 10px 0 0; }
.shortcut-keys {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}
.shortcut-keys kbd {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--soft);
  padding: 6px 10px;
  color: var(--blue-strong);
  font-family: inherit;
  font-weight: 900;
}
.shortcut-keys span {
  margin: 0;
  color: var(--ink);
  font-size: 16px;
}
.pricing-panel {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.price-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(28, 46, 74, 0.07);
}
.price-card.featured {
  border-color: rgba(239, 68, 68, 0.36);
  background: linear-gradient(135deg, #fff, #fff4f3);
}
.price-card h3 {
  margin-bottom: 10px;
  font-size: 26px;
}
.price-card s {
  color: #9aa4b2;
  font-weight: 760;
}
.price-card span {
  color: var(--muted);
}
.bottom-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: linear-gradient(135deg, #fff, #eaf4ff);
  padding: 34px;
  margin: 32px 0 70px;
}
.bottom-cta h2 {
  max-width: 760px;
  margin-bottom: 0;
  font-size: clamp(28px, 3vw, 42px);
}
.faq-section {
  padding-top: 0;
  border-top: 0;
}
.faq-list {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}
details {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 18px 20px;
}
summary {
  cursor: pointer;
  color: var(--ink);
  font-weight: 850;
}
details p {
  margin: 12px 0 0;
}
.site-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.9fr);
  gap: 32px;
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
  padding: 42px 0;
  border-top: 1px solid var(--line);
}
.site-footer p { margin: 12px 0 0; }
.site-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  justify-content: flex-end;
}
.site-footer nav a {
  color: var(--muted);
  font-weight: 720;
}
@media (max-width: 980px) {
  .site-header { align-items: flex-start; flex-wrap: wrap; }
  .site-nav { order: 3; width: 100%; }
  .nav-cta { margin-left: auto; }
  .hero,
  .site-footer,
  .feature-split,
  .shortcut-panel { grid-template-columns: 1fr; }
  .hero { min-height: auto; }
  .steps,
  .card-grid,
  .pricing-panel { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .site-footer nav { justify-content: flex-start; }
}
@media (max-width: 640px) {
  .site-header { padding: 12px 16px; }
  .brand span { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
  main,
  .site-footer { width: min(100% - 24px, 1160px); }
  .hero { gap: 26px; padding-top: 38px; }
  h1 { font-size: 42px; }
  .hero-subcopy { font-size: 18px; }
  .trust-list,
  .steps,
  .card-grid,
  .format-grid,
  .pricing-panel { grid-template-columns: 1fr; }
  .section { padding: 52px 0; }
  .bottom-cta { align-items: stretch; flex-direction: column; padding: 24px; }
  .button,
  .nav-cta { width: 100%; }
}
`;
  fs.writeFileSync(path.join(docsDir, "assets/site.css"), css);
}

function writeRobotsAndSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${absoluteUrl(page.url)}</loc>
    <lastmod>${updatedAt}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  fs.writeFileSync(path.join(docsDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(docsDir, "robots.txt"), robots);
  fs.writeFileSync(path.join(docsDir, "CNAME"), `${customDomain}\n`);
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "");
}

function cleanStalePages() {
  for (const dir of stalePageDirs) {
    fs.rmSync(path.join(docsDir, dir), { recursive: true, force: true });
  }
}

function build() {
  fs.mkdirSync(path.join(docsDir, "assets"), { recursive: true });
  cleanStalePages();
  writeCss();
  writeRobotsAndSitemap();

  for (const page of pages) {
    const outPath = path.join(docsDir, page.path);
    ensureDir(outPath);
    fs.writeFileSync(outPath, renderPage(page));
  }

  console.log(`Built ${pages.length} static SEO pages in docs/.`);
}

build();
