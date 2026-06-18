const elements = {
  body: document.body,
  statusPill: document.getElementById("statusPill"),
  sourceTitle: document.getElementById("sourceTitle"),
  timer: document.getElementById("timer"),
  errorMessage: document.getElementById("errorMessage"),
  historyButton: document.getElementById("historyButton"),
  historyDrawer: document.getElementById("historyDrawer"),
  closeHistoryButton: document.getElementById("closeHistoryButton"),
  historyList: document.getElementById("historyList"),
  historyEmpty: document.getElementById("historyEmpty"),
  clearHistoryButton: document.getElementById("clearHistoryButton"),
  readyPanel: document.getElementById("readyPanel"),
  recordingPanel: document.getElementById("recordingPanel"),
  pausedPanel: document.getElementById("pausedPanel"),
  savePanel: document.getElementById("savePanel"),
  busyPanel: document.getElementById("busyPanel"),
  busyText: document.getElementById("busyText"),
  filenameInput: document.getElementById("filenameInput"),
  startButton: document.getElementById("startButton"),
  pauseButton: document.getElementById("pauseButton"),
  resumeButton: document.getElementById("resumeButton"),
  stopButton: document.getElementById("stopButton"),
  stopPausedButton: document.getElementById("stopPausedButton"),
  saveButton: document.getElementById("saveButton"),
  discardButton: document.getElementById("discardButton"),
};

let currentState = {
  status: "ready",
  statusText: "Ready",
  elapsedMs: 0,
};
let stateReceivedAt = Date.now();
let filenameTouched = false;
let isBusy = false;

document.addEventListener("DOMContentLoaded", init);

function init() {
  elements.startButton.addEventListener("click", () => runCommand("START_RECORDING"));
  elements.pauseButton.addEventListener("click", () => runCommand("PAUSE_RECORDING"));
  elements.resumeButton.addEventListener("click", () => runCommand("RESUME_RECORDING"));
  elements.stopButton.addEventListener("click", () => runCommand("STOP_RECORDING"));
  elements.stopPausedButton.addEventListener("click", () => runCommand("STOP_RECORDING"));
  elements.discardButton.addEventListener("click", () => runCommand("DISCARD_RECORDING"));
  elements.saveButton.addEventListener("click", saveRecording);
  elements.historyButton.addEventListener("click", openHistoryDrawer);
  elements.closeHistoryButton.addEventListener("click", closeHistoryDrawer);
  elements.clearHistoryButton.addEventListener("click", clearHistory);
  elements.filenameInput.addEventListener("input", () => {
    filenameTouched = true;
  });

  refreshState();
  setInterval(updateTimer, 500);
}

async function refreshState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATE" });
    if (!response?.ok) {
      throw new Error(response?.error || "Unable to load recorder state.");
    }
    applyState(response.state);
  } catch (error) {
    showError(error.message);
  }
}

async function runCommand(type) {
  applyOptimisticState(type);
  setBusy(true);
  try {
    const response = await chrome.runtime.sendMessage({ type });
    if (!response?.ok) {
      throw new Error(response?.error || "Recorder command failed.");
    }
    applyState(response.state);
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(false);
  }
}

function applyOptimisticState(type) {
  if (type === "START_RECORDING") {
    applyState({
      ...currentState,
      status: "starting",
      statusText: "Starting",
      error: "",
    });
  }
  if (type === "STOP_RECORDING") {
    applyState({
      ...currentState,
      status: "encoding",
      statusText: "Encoding MP3",
      elapsedMs: getEstimatedElapsedMs(),
      error: "",
    });
  }
}

async function saveRecording() {
  setBusy(true);
  try {
    const record = await window.TabAudioRecorderStorage.getLatestRecording();
    if (!record?.blob) {
      throw new Error("No MP3 recording is ready to save.");
    }

    const filename = normalizeFilename(
      elements.filenameInput.value ||
        record.metadata?.suggestedFilename ||
        "tab-audio-recording.mp3"
    );
    const url = URL.createObjectURL(record.blob);

    await downloadFile(url, filename);
    await window.TabAudioRecorderStorage.addHistoryEntry(record.metadata, filename);
    if (elements.body.dataset.historyOpen === "true") {
      await renderHistory();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);

    const response = await chrome.runtime.sendMessage({ type: "MARK_SAVED" });
    if (response?.ok) {
      applyState(response.state);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(false);
  }
}

async function openHistoryDrawer() {
  elements.body.dataset.historyOpen = "true";
  elements.historyDrawer.setAttribute("aria-hidden", "false");
  await renderHistory();
}

function closeHistoryDrawer() {
  elements.body.dataset.historyOpen = "false";
  elements.historyDrawer.setAttribute("aria-hidden", "true");
}

async function renderHistory() {
  const entries = await window.TabAudioRecorderStorage.getHistoryEntries();
  elements.historyList.textContent = "";
  elements.historyEmpty.hidden = entries.length > 0;
  elements.clearHistoryButton.hidden = entries.length === 0;

  for (const entry of entries) {
    elements.historyList.appendChild(createHistoryItem(entry));
  }
}

function createHistoryItem(entry) {
  const item = document.createElement("article");
  item.className = "history-item";

  const title = document.createElement("button");
  title.className = "history-title";
  title.type = "button";
  title.textContent = entry.title || entry.hostname || "Untitled recording";
  title.title = entry.url || entry.title || "";
  title.addEventListener("click", () => openSourceUrl(entry.url));

  const meta = document.createElement("div");
  meta.className = "history-meta";
  meta.textContent = [
    entry.category || "Audio",
    formatDateTime(entry.savedAt),
    formatDuration(entry.durationMs || 0),
  ].filter(Boolean).join(" · ");

  const url = document.createElement("button");
  url.className = "history-url";
  url.type = "button";
  url.textContent = formatUrl(entry.url);
  url.title = entry.url || "";
  url.addEventListener("click", () => openSourceUrl(entry.url));

  const filename = document.createElement("div");
  filename.className = "history-file";
  filename.textContent = entry.filename || "";

  item.append(title, meta, url, filename);
  return item;
}

async function openSourceUrl(url) {
  if (!url) {
    return;
  }

  await chrome.tabs.create({ url });
}

async function clearHistory() {
  await window.TabAudioRecorderStorage.clearHistoryEntries();
  await renderHistory();
}

function applyState(state) {
  currentState = {
    status: "ready",
    statusText: "Ready",
    elapsedMs: 0,
    ...state,
  };
  stateReceivedAt = Date.now();

  const metadata = currentState.metadata || {};
  elements.body.dataset.state = currentState.status;
  elements.statusPill.textContent = currentState.statusText || "Ready";
  elements.sourceTitle.textContent = metadata.title || "Current tab audio";
  elements.errorMessage.hidden = !currentState.error;
  elements.errorMessage.textContent = currentState.error || "";

  if (
    currentState.status === "ready_to_save" &&
    !filenameTouched &&
    metadata.suggestedFilename
  ) {
    elements.filenameInput.value = normalizeFilename(metadata.suggestedFilename);
  }
  if (currentState.status === "recording") {
    filenameTouched = false;
  }

  renderPanels();
  updateTimer();
}

function renderPanels() {
  const status = currentState.status;

  elements.readyPanel.hidden = !["ready", "saved", "error"].includes(status);
  elements.recordingPanel.hidden = status !== "recording";
  elements.pausedPanel.hidden = status !== "paused";
  elements.savePanel.hidden = status !== "ready_to_save";
  elements.busyPanel.hidden = !["starting", "encoding"].includes(status);
  elements.busyText.textContent = currentState.statusText || "Working";
}

function updateTimer() {
  elements.timer.textContent = formatDuration(getEstimatedElapsedMs());
}

function getEstimatedElapsedMs() {
  if (currentState.status === "recording") {
    return currentState.elapsedMs + Date.now() - stateReceivedAt;
  }
  return currentState.elapsedMs || 0;
}

function showError(message) {
  currentState = {
    ...currentState,
    status: "error",
    statusText: "Error",
    error: message,
  };
  applyState(currentState);
}

function setBusy(nextBusy) {
  isBusy = nextBusy;
  for (const button of document.querySelectorAll("button")) {
    button.disabled = isBusy;
  }
}

function normalizeFilename(value) {
  let filename = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  filename = stripMediaFilenamePrefix(filename);

  if (!filename) {
    filename = "tab-audio-recording.mp3";
  }
  if (!filename.toLowerCase().endsWith(".mp3")) {
    filename += ".mp3";
  }

  return filename;
}

function stripMediaFilenamePrefix(filename) {
  const match = String(filename || "").match(/^(.*?)(\.mp3)?$/i);
  const stem = match?.[1] || "";
  const extension = match?.[2] || "";
  const cleanStem = stem
    .replace(
      /^(audio|lecture|meeting|music|podcast|video)(?:[-_\s:|•·]+)+/i,
      ""
    )
    .trim();

  if (!cleanStem) {
    return filename;
  }

  return `${cleanStem}${extension}`;
}

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url,
        filename,
        saveAs: true,
        conflictAction: "uniquify",
      },
      (downloadId) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(downloadId);
      }
    );
  });
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

function formatDateTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

function formatUrl(url) {
  if (!url) {
    return "No source URL";
  }

  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}
