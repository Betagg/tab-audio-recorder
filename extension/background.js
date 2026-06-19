const OFFSCREEN_DOCUMENT = "offscreen.html";

importScripts("classifier.js");

const RECORDING_TOGGLE_COMMANDS = new Set([
  "toggle-recording",
  "global-toggle-recording",
]);

let cachedState = {
  status: "ready",
  statusText: "Ready",
};

chrome.runtime.onInstalled.addListener(() => {
  updateActionIndicator(cachedState);
});

chrome.runtime.onStartup.addListener(() => {
  updateActionIndicator(cachedState);
});

chrome.commands.onCommand.addListener((command) => {
  if (!RECORDING_TOGGLE_COMMANDS.has(command)) {
    return;
  }

  toggleRecordingFromCommand().catch((error) => {
    cachedState = normalizeState({
      status: "error",
      statusText: "Error",
      error: error.message,
      metadata: cachedState.metadata,
      recording: cachedState.recording,
    });
    updateActionIndicator(cachedState);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === "offscreen") {
    return false;
  }

  handleMessage(message, sender)
    .then((response) => sendResponse({ ok: true, ...response }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

async function handleMessage(message) {
  switch (message.type) {
    case "GET_STATE":
      return { state: await getCurrentState() };
    case "START_RECORDING":
      return { state: await startRecording() };
    case "PAUSE_RECORDING":
      return { state: await sendToOffscreen({ type: "PAUSE_RECORDING" }) };
    case "RESUME_RECORDING":
      return { state: await sendToOffscreen({ type: "RESUME_RECORDING" }) };
    case "STOP_RECORDING":
      return { state: await sendToOffscreen({ type: "STOP_RECORDING" }) };
    case "DISCARD_RECORDING":
      return { state: await sendToOffscreen({ type: "DISCARD_RECORDING" }) };
    case "MARK_SAVED":
      return { state: await sendToOffscreen({ type: "MARK_SAVED" }) };
    case "OFFSCREEN_STATE":
      cachedState = normalizeState(message.state);
      await updateActionIndicator(cachedState);
      return { state: cachedState };
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

async function startRecording() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    throw new Error("Open a tab with audio before starting a recording.");
  }

  await ensureOffscreenDocument();

  const streamId = await getMediaStreamId(tab.id);
  const tabInfo = getTabInfo(tab);
  const pageSignals = await collectPageSignals(tab).catch(() => ({}));
  const metadata = TabAudioClassifier.buildRecordingMetadata(tabInfo, pageSignals);

  cachedState = {
    status: "starting",
    statusText: "Starting",
    metadata,
  };
  await updateActionIndicator(cachedState);

  return await sendToOffscreen({
    type: "START_RECORDING",
    streamId,
    metadata,
  });
}

async function toggleRecordingFromCommand() {
  const state = await getCurrentState();

  if (state.status === "recording") {
    return await sendToOffscreen({ type: "PAUSE_RECORDING" });
  }

  if (state.status === "paused") {
    return await sendToOffscreen({ type: "RESUME_RECORDING" });
  }

  if (["ready", "saved", "error"].includes(state.status)) {
    return await startRecording();
  }

  return state;
}

async function getCurrentState() {
  if (!(await hasOffscreenDocument())) {
    return cachedState;
  }

  try {
    return await sendToOffscreen({ type: "GET_OFFSCREEN_STATE" });
  } catch (error) {
    return cachedState;
  }
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT,
    reasons: ["USER_MEDIA"],
    justification:
      "Capture audio from the current tab after the user starts recording.",
  });
}

async function hasOffscreenDocument() {
  if (chrome.offscreen.hasDocument) {
    return await chrome.offscreen.hasDocument();
  }

  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT)],
  });
  return contexts.length > 0;
}

function getMediaStreamId(targetTabId) {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId }, (streamId) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!streamId) {
        reject(new Error("Chrome did not provide a tab audio stream."));
        return;
      }
      resolve(streamId);
    });
  });
}

function sendToOffscreen(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ target: "offscreen", ...message }, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!response || response.ok === false) {
        reject(new Error(response?.error || "Offscreen recorder did not respond."));
        return;
      }
      cachedState = normalizeState(response.state || response);
      updateActionIndicator(cachedState);
      resolve(cachedState);
    });
  });
}

async function updateActionIndicator(state = cachedState) {
  const status = state.status || "ready";
  let text = "";
  let color = "#5A9DEE";
  let title = "Tab Audio Recorder";

  if (status === "recording") {
    text = "REC";
    color = "#E5343F";
    title = "Tab Audio Recorder - Recording";
  } else if (status === "paused") {
    text = "PAU";
    color = "#F5A524";
    title = "Tab Audio Recorder - Paused";
  }

  try {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setTitle({ title });
  } catch {
    // The toolbar badge is a convenience indicator; recording should continue if it fails.
  }
}

function getTabInfo(tab) {
  let url;
  try {
    url = new URL(tab.url || "");
  } catch {
    url = null;
  }

  return {
    title: tab.title || "Untitled tab",
    url: tab.url || "",
    hostname: url?.hostname?.replace(/^www\./, "") || "browser-tab",
  };
}

async function collectPageSignals(tab) {
  if (!tab.id || !canInspectTab(tab.url)) {
    return {};
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectPageContext,
  });

  return result?.result || {};
}

function canInspectTab(url) {
  return /^(https?:|file:)/i.test(url || "");
}

function collectPageContext() {
  const readMeta = (...names) => {
    for (const name of names) {
      const selector = [
        `meta[name="${name}"]`,
        `meta[property="${name}"]`,
        `meta[itemprop="${name}"]`,
      ].join(",");
      const value = document.querySelector(selector)?.getAttribute("content");
      if (value) {
        return value.trim();
      }
    }
    return "";
  };

  const getText = (selector, limit) => {
    return Array.from(document.querySelectorAll(selector))
      .map((node) => node.textContent || "")
      .map((text) => text.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, limit);
  };

  const media = Array.from(document.querySelectorAll("audio, video"));
  const audioCount = document.querySelectorAll("audio").length;
  const videoCount = document.querySelectorAll("video").length;
  const playingMediaCount = media.filter((item) => !item.paused && !item.ended).length;
  const durationHints = media
    .map((item) => Number.isFinite(item.duration) ? Math.round(item.duration) : 0)
    .filter((duration) => duration > 0)
    .slice(0, 4);

  const jsonLdTypes = [];
  let jsonLdHeadline = "";
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(script.textContent || "null");
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      for (const entry of entries.flatMap((item) => item?.["@graph"] || item || [])) {
        const type = entry?.["@type"];
        if (Array.isArray(type)) {
          jsonLdTypes.push(...type.map(String));
        } else if (type) {
          jsonLdTypes.push(String(type));
        }
        jsonLdHeadline ||= entry?.headline || entry?.name || "";
      }
    } catch {
      // Ignore invalid structured data from the page.
    }
  }

  return {
    title: document.title || "",
    url: location.href,
    hostname: location.hostname,
    description: readMeta("description", "og:description", "twitter:description"),
    keywords: readMeta("keywords", "news_keywords"),
    ogTitle: readMeta("og:title", "twitter:title"),
    ogType: readMeta("og:type"),
    ogSiteName: readMeta("og:site_name", "application-name"),
    applicationName: readMeta("application-name"),
    jsonLdTypes: Array.from(new Set(jsonLdTypes)).slice(0, 12),
    jsonLdHeadline: String(jsonLdHeadline || "").trim(),
    headings: getText("h1,h2", 6),
    audioCount,
    videoCount,
    playingMediaCount,
    durationHints,
  };
}

function normalizeState(state = {}) {
  return {
    status: state.status || "ready",
    statusText: state.statusText || state.status || "Ready",
    elapsedMs: state.elapsedMs || 0,
    error: state.error || "",
    metadata: state.metadata || null,
    recording: state.recording || null,
  };
}
