const elements = {
  body: document.body,
  statusPill: document.getElementById("statusPill"),
  sourceTitle: document.getElementById("sourceTitle"),
  timer: document.getElementById("timer"),
  errorMessage: document.getElementById("errorMessage"),
  shortcutHint: document.getElementById("shortcutHint"),
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
  trimEditor: document.getElementById("trimEditor"),
  trimDuration: document.getElementById("trimDuration"),
  trimStartInput: document.getElementById("trimStartInput"),
  trimEndInput: document.getElementById("trimEndInput"),
  trimStartTime: document.getElementById("trimStartTime"),
  trimEndTime: document.getElementById("trimEndTime"),
  trimWaveformCanvas: document.getElementById("trimWaveformCanvas"),
  trimPreviewButton: document.getElementById("trimPreviewButton"),
  trimResetButton: document.getElementById("trimResetButton"),
  filenameInput: document.getElementById("filenameInput"),
  startButton: document.getElementById("startButton"),
  pauseButton: document.getElementById("pauseButton"),
  resumeButton: document.getElementById("resumeButton"),
  stopButton: document.getElementById("stopButton"),
  stopPausedButton: document.getElementById("stopPausedButton"),
  saveButton: document.getElementById("saveButton"),
  discardButton: document.getElementById("discardButton"),
};

const MP3_KBPS = 128;
const MP3_CHUNK_SIZE = 1152;
const MIN_TRIM_MS = 1000;
const FULL_TRIM_TOLERANCE_MS = 250;
const WAVEFORM_BUCKETS = 180;
const WAVEFORM_HEIGHT = 54;

let currentState = {
  status: "ready",
  statusText: "Ready",
  elapsedMs: 0,
};
let stateReceivedAt = Date.now();
let filenameTouched = false;
let isBusy = false;
let trimState = {
  durationMs: 0,
  startMs: 0,
  endMs: 0,
};
let previewAudio = null;
let previewObjectUrl = "";
let previewTimer = 0;
let previewCursorMs = null;
let decodedRecording = {
  key: "",
  audioBuffer: null,
};
let waveformState = {
  loading: false,
  peaks: [],
  error: "",
};
let waveformRequestId = 0;
let waveformDragHandle = "";

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderShortcutHint();
  elements.startButton.addEventListener("click", () => runCommand("START_RECORDING"));
  elements.pauseButton.addEventListener("click", () => runCommand("PAUSE_RECORDING"));
  elements.resumeButton.addEventListener("click", () => runCommand("RESUME_RECORDING"));
  elements.stopButton.addEventListener("click", () => runCommand("STOP_RECORDING"));
  elements.stopPausedButton.addEventListener("click", () => runCommand("STOP_RECORDING"));
  elements.discardButton.addEventListener("click", () => {
    stopPreview();
    runCommand("DISCARD_RECORDING");
  });
  elements.saveButton.addEventListener("click", saveRecording);
  elements.historyButton.addEventListener("click", openHistoryDrawer);
  elements.closeHistoryButton.addEventListener("click", closeHistoryDrawer);
  elements.clearHistoryButton.addEventListener("click", clearHistory);
  elements.trimStartInput.addEventListener("input", () => updateTrimSelection("start"));
  elements.trimEndInput.addEventListener("input", () => updateTrimSelection("end"));
  elements.trimResetButton.addEventListener("click", resetTrimToFull);
  elements.trimPreviewButton.addEventListener("click", toggleTrimPreview);
  elements.trimWaveformCanvas.addEventListener("pointerdown", beginWaveformDrag);
  elements.trimWaveformCanvas.addEventListener("pointermove", updateWaveformDrag);
  elements.trimWaveformCanvas.addEventListener("pointerup", endWaveformDrag);
  elements.trimWaveformCanvas.addEventListener("pointercancel", endWaveformDrag);
  window.addEventListener("resize", renderWaveform);
  elements.filenameInput.addEventListener("input", () => {
    filenameTouched = true;
  });

  renderTrimControls();
  renderWaveform();
  refreshState();
  setInterval(updateTimer, 500);
}

function renderShortcutHint() {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "");
  elements.shortcutHint.textContent = isMac
    ? "Shortcut: ⌘⇧Y · Global: Ctrl⇧8"
    : "Shortcut: Ctrl⇧Y · Global: Ctrl⇧8";
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
  stopPreview();
  setBusy(true);
  const previousStatusText = elements.statusPill.textContent;
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
    const trim = getTrimBounds();
    let blob = record.blob;
    let metadata = record.metadata || {};

    if (shouldExportTrimmedSegment(trim)) {
      elements.statusPill.textContent = "Trimming";
      blob = await createTrimmedMp3(record, trim.startMs, trim.endMs);
      metadata = {
        ...metadata,
        durationMs: trim.endMs - trim.startMs,
        originalDurationMs: metadata.durationMs || trim.durationMs,
        trimStartMs: trim.startMs,
        trimEndMs: trim.endMs,
        trimmed: true,
        size: blob.size,
        mimeType: "audio/mpeg",
      };
    }

    elements.statusPill.textContent = "Saving";
    const url = URL.createObjectURL(blob);

    await downloadFile(url, filename);
    await window.TabAudioRecorderStorage.addHistoryEntry(metadata, filename);
    if (elements.body.dataset.historyOpen === "true") {
      await renderHistory();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);

    const response = await chrome.runtime.sendMessage({ type: "MARK_SAVED" });
    if (response?.ok) {
      applyState(response.state);
    } else {
      elements.statusPill.textContent = previousStatusText;
    }
  } catch (error) {
    elements.statusPill.textContent = previousStatusText;
    showError(error.message);
  } finally {
    setBusy(false);
  }
}

function resetTrimToFull() {
  stopPreview();
  setTrimState({
    durationMs: trimState.durationMs,
    startMs: 0,
    endMs: trimState.durationMs,
  });
}

function updateTrimSelection(changedHandle) {
  stopPreview();

  const durationMs = trimState.durationMs;
  if (durationMs <= 0) {
    setTrimState({ durationMs: 0, startMs: 0, endMs: 0 });
    return;
  }

  const minimumGap = Math.min(MIN_TRIM_MS, durationMs);
  let startMs = Number(elements.trimStartInput.value) || 0;
  let endMs = Number(elements.trimEndInput.value) || durationMs;

  startMs = clamp(startMs, 0, durationMs);
  endMs = clamp(endMs, 0, durationMs);

  if (changedHandle === "start" && startMs > endMs - minimumGap) {
    startMs = Math.max(0, endMs - minimumGap);
  }
  if (changedHandle === "end" && endMs < startMs + minimumGap) {
    endMs = Math.min(durationMs, startMs + minimumGap);
  }
  if (startMs > endMs) {
    [startMs, endMs] = [endMs, startMs];
  }

  setTrimState({ durationMs, startMs, endMs });
}

function setTrimState(nextState) {
  const durationMs = Math.max(0, Math.round(nextState.durationMs || 0));
  const startMs = clamp(Math.round(nextState.startMs || 0), 0, durationMs);
  const endMs = clamp(Math.round(nextState.endMs || durationMs), startMs, durationMs);

  trimState = { durationMs, startMs, endMs };
  renderTrimControls();
  renderWaveform();
}

function renderTrimControls() {
  const durationMs = trimState.durationMs;
  const canSelect = durationMs > 0;
  const isFullSelection = !shouldExportTrimmedSegment(getTrimBounds());
  const selectedMs = Math.max(0, trimState.endMs - trimState.startMs);

  elements.trimStartInput.max = String(durationMs);
  elements.trimEndInput.max = String(durationMs);
  elements.trimStartInput.value = String(trimState.startMs);
  elements.trimEndInput.value = String(trimState.endMs);
  elements.trimStartTime.textContent = formatTrimTime(trimState.startMs);
  elements.trimEndTime.textContent = formatTrimTime(trimState.endMs);
  elements.trimDuration.textContent = canSelect
    ? `Keep ${formatTrimTime(selectedMs)} of ${formatTrimTime(durationMs)}`
    : "Full recording";

  elements.trimStartInput.disabled = isBusy || !canSelect;
  elements.trimEndInput.disabled = isBusy || !canSelect;
  elements.trimPreviewButton.disabled = isBusy || !canSelect;
  elements.trimResetButton.disabled = isBusy || !canSelect || isFullSelection;
}

function syncTrimFromState() {
  const metadata = currentState.metadata || {};
  const durationMs = Math.round(
    currentState.recording?.durationMs || metadata.durationMs || currentState.elapsedMs || 0
  );

  if (currentState.status !== "ready_to_save") {
    if (trimState.durationMs > 0) {
      setTrimState({ durationMs: 0, startMs: 0, endMs: 0 });
    }
    clearWaveformState();
    stopPreview();
    return;
  }

  if (trimState.durationMs !== durationMs) {
    setTrimState({ durationMs, startMs: 0, endMs: durationMs });
    loadWaveformForLatestRecording();
  } else {
    renderTrimControls();
    renderWaveform();
  }
}

async function loadWaveformForLatestRecording() {
  const requestId = waveformRequestId + 1;
  waveformRequestId = requestId;
  waveformState = {
    loading: true,
    peaks: [],
    error: "",
  };
  renderWaveform();

  try {
    const record = await window.TabAudioRecorderStorage.getLatestRecording();
    if (!record?.blob) {
      throw new Error("No recording is ready.");
    }

    const audioBuffer = await getDecodedAudioBuffer(record);
    if (requestId !== waveformRequestId) {
      return;
    }

    waveformState = {
      loading: false,
      peaks: buildWaveformPeaks(audioBuffer),
      error: "",
    };
  } catch {
    if (requestId !== waveformRequestId) {
      return;
    }
    waveformState = {
      loading: false,
      peaks: [],
      error: "Waveform unavailable",
    };
  }

  renderWaveform();
}

function clearWaveformState() {
  waveformRequestId += 1;
  waveformState = {
    loading: false,
    peaks: [],
    error: "",
  };
  decodedRecording = {
    key: "",
    audioBuffer: null,
  };
  renderWaveform();
}

function buildWaveformPeaks(audioBuffer) {
  const bucketCount = WAVEFORM_BUCKETS;
  const peaks = new Array(bucketCount).fill(0);
  const channelCount = Math.min(2, Math.max(1, audioBuffer.numberOfChannels || 1));
  const samplesPerBucket = Math.max(1, Math.floor(audioBuffer.length / bucketCount));
  let maxPeak = 0;

  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const start = bucket * samplesPerBucket;
    const end = bucket === bucketCount - 1
      ? audioBuffer.length
      : Math.min(audioBuffer.length, start + samplesPerBucket);
    const stride = Math.max(1, Math.floor((end - start) / 80));
    let peak = 0;

    for (let channel = 0; channel < channelCount; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = start; index < end; index += stride) {
        peak = Math.max(peak, Math.abs(data[index] || 0));
      }
    }

    peaks[bucket] = peak;
    maxPeak = Math.max(maxPeak, peak);
  }

  if (maxPeak <= 0) {
    return peaks;
  }

  return peaks.map((peak) => Math.sqrt(peak / maxPeak));
}

function renderWaveform() {
  const canvas = elements.trimWaveformCanvas;
  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 260));
  const height = WAVEFORM_HEIGHT;
  const scale = window.devicePixelRatio || 1;

  if (canvas.width !== Math.round(width * scale)) {
    canvas.width = Math.round(width * scale);
  }
  if (canvas.height !== Math.round(height * scale)) {
    canvas.height = Math.round(height * scale);
  }

  const context = canvas.getContext("2d");
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);

  drawWaveformBackground(context, width, height);

  if (waveformState.loading) {
    drawWaveformLoading(context, width, height);
    return;
  }

  if (waveformState.error) {
    drawWaveformMessage(context, width, height, waveformState.error);
    return;
  }

  const peaks = waveformState.peaks;
  if (peaks.length === 0 || trimState.durationMs <= 0) {
    drawWaveformMessage(context, width, height, "Waveform will appear here");
    return;
  }

  drawWaveformBars(context, width, height, peaks);
  drawWaveformSelection(context, width, height);
}

function drawWaveformBackground(context, width, height) {
  context.fillStyle = "#f8fbfe";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#eef4f8";
  context.fillRect(0, height / 2, width, 1);
}

function drawWaveformLoading(context, width, height) {
  const bars = 36;
  const gap = 3;
  const barWidth = Math.max(2, Math.floor((width - gap * (bars - 1)) / bars));

  context.strokeStyle = "#cbd6e2";
  context.lineWidth = barWidth;
  context.lineCap = "round";

  for (let index = 0; index < bars; index += 1) {
    const x = index * (barWidth + gap) + barWidth / 2;
    const wave = Math.sin(index * 0.72) * 0.5 + 0.5;
    const amplitude = 8 + wave * 24;
    context.globalAlpha = 0.3 + wave * 0.32;
    drawWaveformBar(context, x, height / 2, amplitude);
  }

  context.globalAlpha = 1;
}

function drawWaveformMessage(context, width, height, message) {
  context.fillStyle = "#9aa4b0";
  context.font = "650 11px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(message, width / 2, height / 2);
}

function drawWaveformBars(context, width, height, peaks) {
  const centerY = height / 2;
  const barGap = 1.4;
  const barWidth = Math.max(1.4, width / peaks.length - barGap);
  const startX = timeToWaveformX(trimState.startMs, width);
  const endX = timeToWaveformX(trimState.endMs, width);

  context.lineCap = "round";
  context.lineWidth = barWidth;

  for (let index = 0; index < peaks.length; index += 1) {
    const x = index * (barWidth + barGap) + barWidth / 2;
    const amplitude = Math.max(3, peaks[index] * (height - 16));
    context.strokeStyle =
      x >= startX && x <= endX ? "#13b8c8" : "#b7c5d2";
    drawWaveformBar(context, x, centerY, amplitude);
  }
}

function drawWaveformSelection(context, width, height) {
  const startX = timeToWaveformX(trimState.startMs, width);
  const endX = timeToWaveformX(trimState.endMs, width);

  context.save();
  context.fillStyle = "rgba(19, 184, 200, 0.13)";
  context.fillRect(startX, 0, Math.max(1, endX - startX), height);

  context.fillStyle = "rgba(248, 251, 254, 0.58)";
  context.fillRect(0, 0, startX, height);
  context.fillRect(endX, 0, Math.max(0, width - endX), height);

  drawWaveformHandle(context, startX, height, "#ff5f3d");
  drawWaveformHandle(context, endX, height, "#ff5f3d");
  drawWaveformPlayhead(context, width, height);
  context.restore();
}

function drawWaveformBar(context, x, centerY, amplitude) {
  context.beginPath();
  context.moveTo(x, centerY - amplitude / 2);
  context.lineTo(x, centerY + amplitude / 2);
  context.stroke();
}

function drawWaveformHandle(context, x, height, color) {
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x, 5);
  context.lineTo(x, height - 5);
  context.stroke();

  context.fillStyle = color;
  context.beginPath();
  context.roundRect?.(x - 4, 4, 8, 8, 3);
  if (!context.roundRect) {
    context.rect(x - 4, 4, 8, 8);
  }
  context.fill();
}

function drawWaveformPlayhead(context, width, height) {
  if (previewCursorMs === null) {
    return;
  }

  const x = timeToWaveformX(previewCursorMs, width);
  context.strokeStyle = "#141a22";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(x, 6);
  context.lineTo(x, height - 6);
  context.stroke();
}

function beginWaveformDrag(event) {
  if (isBusy || trimState.durationMs <= 0) {
    return;
  }

  stopPreview();
  const milliseconds = waveformEventToMilliseconds(event);
  waveformDragHandle = getNearestTrimHandle(milliseconds);
  elements.trimWaveformCanvas.setPointerCapture?.(event.pointerId);
  setTrimHandleFromMilliseconds(waveformDragHandle, milliseconds);
}

function updateWaveformDrag(event) {
  if (!waveformDragHandle) {
    return;
  }
  setTrimHandleFromMilliseconds(
    waveformDragHandle,
    waveformEventToMilliseconds(event)
  );
}

function endWaveformDrag(event) {
  if (!waveformDragHandle) {
    return;
  }
  elements.trimWaveformCanvas.releasePointerCapture?.(event.pointerId);
  waveformDragHandle = "";
}

function setTrimHandleFromMilliseconds(handle, milliseconds) {
  const durationMs = trimState.durationMs;
  const minimumGap = Math.min(MIN_TRIM_MS, durationMs);
  const nextMs = clamp(Math.round(milliseconds), 0, durationMs);

  if (handle === "start") {
    setTrimState({
      durationMs,
      startMs: Math.min(nextMs, trimState.endMs - minimumGap),
      endMs: trimState.endMs,
    });
    return;
  }

  setTrimState({
    durationMs,
    startMs: trimState.startMs,
    endMs: Math.max(nextMs, trimState.startMs + minimumGap),
  });
}

function getNearestTrimHandle(milliseconds) {
  const startDistance = Math.abs(milliseconds - trimState.startMs);
  const endDistance = Math.abs(milliseconds - trimState.endMs);
  return startDistance <= endDistance ? "start" : "end";
}

function waveformEventToMilliseconds(event) {
  const rect = elements.trimWaveformCanvas.getBoundingClientRect();
  const ratio = rect.width > 0
    ? clamp((event.clientX - rect.left) / rect.width, 0, 1)
    : 0;
  return ratio * trimState.durationMs;
}

function timeToWaveformX(milliseconds, width) {
  if (trimState.durationMs <= 0) {
    return 0;
  }
  return clamp(milliseconds / trimState.durationMs, 0, 1) * width;
}

function getTrimBounds() {
  return {
    durationMs: trimState.durationMs,
    startMs: trimState.startMs,
    endMs: trimState.endMs,
  };
}

function shouldExportTrimmedSegment(trim) {
  if (!trim.durationMs || trim.durationMs <= 0) {
    return false;
  }

  return (
    trim.startMs > FULL_TRIM_TOLERANCE_MS ||
    trim.endMs < trim.durationMs - FULL_TRIM_TOLERANCE_MS
  );
}

async function toggleTrimPreview() {
  if (previewAudio && !previewAudio.paused) {
    stopPreview();
    return;
  }

  const record = await window.TabAudioRecorderStorage.getLatestRecording();
  if (!record?.blob) {
    showError("No MP3 recording is ready to preview.");
    return;
  }

  const trim = getTrimBounds();
  if (!trim.durationMs) {
    return;
  }

  stopPreview();
  previewObjectUrl = URL.createObjectURL(record.blob);
  previewAudio = new Audio(previewObjectUrl);
  previewAudio.currentTime = trim.startMs / 1000;
  previewAudio.onended = () => stopPreview();

  try {
    await previewAudio.play();
    elements.trimPreviewButton.textContent = "Stop";
    previewCursorMs = trim.startMs;
    renderWaveform();
    previewTimer = window.setInterval(() => {
      if (!previewAudio || previewAudio.currentTime >= trim.endMs / 1000) {
        stopPreview();
        return;
      }
      previewCursorMs = previewAudio.currentTime * 1000;
      renderWaveform();
    }, 80);
  } catch (error) {
    stopPreview();
    showError(error.message);
  }
}

function stopPreview() {
  if (previewTimer) {
    window.clearInterval(previewTimer);
    previewTimer = 0;
  }
  if (previewAudio) {
    previewAudio.pause();
    previewAudio.removeAttribute("src");
    previewAudio.onended = null;
    previewAudio.load();
    previewAudio = null;
  }
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }
  previewCursorMs = null;
  elements.trimPreviewButton.textContent = "Preview";
  renderWaveform();
}

async function getDecodedAudioBuffer(record) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  const recordingKey = getRecordingKey(record);

  if (decodedRecording.key === recordingKey && decodedRecording.audioBuffer) {
    return decodedRecording.audioBuffer;
  }

  if (!AudioContextConstructor) {
    throw new Error("Audio decoding is not available in this browser.");
  }

  const audioContext = new AudioContextConstructor();

  try {
    const arrayBuffer = await record.blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    decodedRecording = {
      key: recordingKey,
      audioBuffer,
    };
    return audioBuffer;
  } finally {
    await audioContext.close().catch(() => {});
  }
}

function getRecordingKey(record) {
  return [
    record?.savedAt || 0,
    record?.blob?.size || 0,
    record?.metadata?.durationMs || 0,
  ].join(":");
}

async function createTrimmedMp3(record, startMs, endMs) {
  const Mp3Encoder = window.lamejs?.Mp3Encoder;

  if (!Mp3Encoder) {
    throw new Error("MP3 encoder is not available.");
  }

  const audioBuffer = await getDecodedAudioBuffer(record);
  return await encodeAudioBufferSegment(audioBuffer, startMs, endMs, Mp3Encoder);
}

async function encodeAudioBufferSegment(audioBuffer, startMs, endMs, Mp3Encoder) {
  const channelCount = Math.min(2, Math.max(1, audioBuffer.numberOfChannels || 1));
  const sampleRate = audioBuffer.sampleRate;
  const startFrame = clamp(
    Math.floor((startMs / 1000) * sampleRate),
    0,
    audioBuffer.length
  );
  const endFrame = clamp(
    Math.ceil((endMs / 1000) * sampleRate),
    startFrame + 1,
    audioBuffer.length
  );
  const frameCount = endFrame - startFrame;

  if (frameCount <= 0) {
    throw new Error("Select a longer audio segment before saving.");
  }

  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel =
    channelCount > 1 ? audioBuffer.getChannelData(1) : leftChannel;
  const encoder = new Mp3Encoder(channelCount, sampleRate, MP3_KBPS);
  const mp3Parts = [];

  for (let offset = 0; offset < frameCount; offset += MP3_CHUNK_SIZE) {
    const chunkStart = startFrame + offset;
    const chunkEnd = Math.min(endFrame, chunkStart + MP3_CHUNK_SIZE);
    const left = floatToInt16(leftChannel.subarray(chunkStart, chunkEnd));
    const encoded =
      channelCount > 1
        ? encoder.encodeBuffer(
            left,
            floatToInt16(rightChannel.subarray(chunkStart, chunkEnd))
          )
        : encoder.encodeBuffer(left);

    if (encoded.length > 0) {
      mp3Parts.push(encoded);
    }

    if (offset % (MP3_CHUNK_SIZE * 80) === 0) {
      await waitForNextFrame();
    }
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) {
    mp3Parts.push(flushed);
  }

  return new Blob(mp3Parts, { type: "audio/mpeg" });
}

function floatToInt16(floatBuffer) {
  const intBuffer = new Int16Array(floatBuffer.length);

  for (let index = 0; index < floatBuffer.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, floatBuffer[index]));
    intBuffer[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return intBuffer;
}

function waitForNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
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
  syncTrimFromState();

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
  for (const control of document.querySelectorAll("button, input")) {
    control.disabled = isBusy;
  }
  renderTrimControls();
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

function formatTrimTime(milliseconds) {
  const safeMilliseconds = Math.max(0, Math.round(milliseconds || 0));
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const tenths = Math.floor((safeMilliseconds % 1000) / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}.${tenths}`;
  }
  return `${minutes}:${pad(seconds)}.${tenths}`;
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
