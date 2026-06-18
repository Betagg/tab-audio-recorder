const BUFFER_SIZE = 4096;
const MP3_KBPS = 128;

let mediaStream = null;
let audioContext = null;
let sourceNode = null;
let processorNode = null;
let leftChunks = [];
let rightChunks = [];
let sampleCount = 0;
let sampleRate = 44100;
let elapsedBaseMs = 0;
let lastStartedAt = 0;
let isStopping = false;

let recorderState = {
  status: "ready",
  statusText: "Ready",
  metadata: null,
  recording: null,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen") {
    return false;
  }

  handleMessage(message)
    .then((state) => sendResponse({ ok: true, state }))
    .catch((error) => {
      const state = setRecorderState({
        status: "error",
        statusText: "Error",
        error: error.message,
      });
      sendResponse({ ok: false, error: error.message, state });
    });

  return true;
});

async function handleMessage(message) {
  switch (message.type) {
    case "GET_OFFSCREEN_STATE":
      return getPublicState();
    case "START_RECORDING":
      return await startRecording(message.streamId, message.metadata);
    case "PAUSE_RECORDING":
      return pauseRecording();
    case "RESUME_RECORDING":
      return resumeRecording();
    case "STOP_RECORDING":
      return await stopRecording();
    case "DISCARD_RECORDING":
      return await discardRecording();
    case "MARK_SAVED":
      return markSaved();
    default:
      throw new Error(`Unknown recorder command: ${message.type}`);
  }
}

async function startRecording(streamId, metadata) {
  if (["recording", "paused", "encoding", "starting"].includes(recorderState.status)) {
    throw new Error("A recording is already in progress.");
  }
  if (!streamId) {
    throw new Error("Missing tab audio stream.");
  }

  await cleanupAudio();
  await window.TabAudioRecorderStorage.clearLatestRecording();

  leftChunks = [];
  rightChunks = [];
  sampleCount = 0;
  elapsedBaseMs = 0;
  lastStartedAt = Date.now();
  isStopping = false;

  setRecorderState({
    status: "starting",
    statusText: "Starting",
    error: "",
    metadata,
    recording: null,
  });

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  });

  audioContext = new AudioContext();
  sampleRate = audioContext.sampleRate;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  sourceNode = audioContext.createMediaStreamSource(mediaStream);
  processorNode = audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);

  processorNode.onaudioprocess = captureAudioFrame;
  sourceNode.connect(processorNode);
  processorNode.connect(audioContext.destination);

  for (const track of mediaStream.getAudioTracks()) {
    track.addEventListener("ended", () => {
      if (!isStopping && ["recording", "paused"].includes(recorderState.status)) {
        stopRecording().catch((error) => {
          setRecorderState({
            status: "error",
            statusText: "Error",
            error: error.message,
          });
        });
      }
    });
  }

  return setRecorderState({
    status: "recording",
    statusText: "Recording",
    metadata: {
      ...metadata,
      sampleRate,
    },
  });
}

function captureAudioFrame(event) {
  const input = event.inputBuffer;
  const output = event.outputBuffer;
  const left = input.getChannelData(0);
  const right = input.numberOfChannels > 1 ? input.getChannelData(1) : left;

  output.getChannelData(0).set(left);
  if (output.numberOfChannels > 1) {
    output.getChannelData(1).set(right);
  }

  if (recorderState.status !== "recording") {
    return;
  }

  leftChunks.push(new Float32Array(left));
  rightChunks.push(new Float32Array(right));
  sampleCount += left.length;
}

function pauseRecording() {
  if (recorderState.status !== "recording") {
    return getPublicState();
  }

  elapsedBaseMs = getElapsedMs();
  lastStartedAt = 0;

  return setRecorderState({
    status: "paused",
    statusText: "Paused",
  });
}

function resumeRecording() {
  if (recorderState.status !== "paused") {
    return getPublicState();
  }

  lastStartedAt = Date.now();

  return setRecorderState({
    status: "recording",
    statusText: "Recording",
  });
}

async function stopRecording() {
  if (!["recording", "paused", "starting"].includes(recorderState.status)) {
    return getPublicState();
  }

  isStopping = true;
  elapsedBaseMs = getElapsedMs();
  lastStartedAt = 0;

  setRecorderState({
    status: "encoding",
    statusText: "Encoding MP3",
  });

  await cleanupAudio();

  if (sampleCount === 0) {
    throw new Error("No tab audio was captured. Make sure the tab is playing audio.");
  }

  const blob = await encodeMp3();
  const metadata = {
    ...recorderState.metadata,
    durationMs: elapsedBaseMs,
    stoppedAt: Date.now(),
    size: blob.size,
    mimeType: "audio/mpeg",
  };

  await window.TabAudioRecorderStorage.saveLatestRecording(blob, metadata);

  leftChunks = [];
  rightChunks = [];
  sampleCount = 0;

  return setRecorderState({
    status: "ready_to_save",
    statusText: "Ready to Save",
    metadata,
    recording: {
      durationMs: metadata.durationMs,
      size: metadata.size,
      mimeType: metadata.mimeType,
      suggestedFilename: metadata.suggestedFilename,
    },
  });
}

async function discardRecording() {
  isStopping = true;
  await cleanupAudio();
  await window.TabAudioRecorderStorage.clearLatestRecording();

  leftChunks = [];
  rightChunks = [];
  sampleCount = 0;
  elapsedBaseMs = 0;
  lastStartedAt = 0;

  return setRecorderState({
    status: "ready",
    statusText: "Ready",
    error: "",
    metadata: null,
    recording: null,
  });
}

function markSaved() {
  if (recorderState.status !== "ready_to_save") {
    return getPublicState();
  }

  return setRecorderState({
    status: "saved",
    statusText: "Saved",
  });
}

async function encodeMp3() {
  if (!self.lamejs || !self.lamejs.Mp3Encoder) {
    throw new Error("MP3 encoder is not available.");
  }

  const encoder = new self.lamejs.Mp3Encoder(2, sampleRate, MP3_KBPS);
  const mp3Parts = [];

  for (let index = 0; index < leftChunks.length; index += 1) {
    const left = floatToInt16(leftChunks[index]);
    const right = floatToInt16(rightChunks[index]);
    const encoded = encoder.encodeBuffer(left, right);

    if (encoded.length > 0) {
      mp3Parts.push(encoded);
    }

    if (index % 24 === 0) {
      const progress = Math.round((index / leftChunks.length) * 100);
      setRecorderState({
        status: "encoding",
        statusText: `Encoding ${progress}%`,
      });
      await waitForNextFrame();
    }
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) {
    mp3Parts.push(flushed);
  }

  setRecorderState({
    status: "encoding",
    statusText: "Encoding 100%",
  });

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

async function cleanupAudio() {
  if (processorNode) {
    processorNode.onaudioprocess = null;
    processorNode.disconnect();
    processorNode = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
    mediaStream = null;
  }
  if (audioContext) {
    await audioContext.close().catch(() => {});
    audioContext = null;
  }
}

function getElapsedMs() {
  if (recorderState.status === "recording" && lastStartedAt > 0) {
    return elapsedBaseMs + Date.now() - lastStartedAt;
  }
  return elapsedBaseMs;
}

function getPublicState() {
  return {
    status: recorderState.status,
    statusText: recorderState.statusText,
    elapsedMs: getElapsedMs(),
    error: recorderState.error || "",
    metadata: recorderState.metadata || null,
    recording: recorderState.recording || null,
  };
}

function setRecorderState(updates) {
  recorderState = {
    ...recorderState,
    ...updates,
  };

  const publicState = getPublicState();
  publishState(publicState);
  return publicState;
}

function publishState(state) {
  chrome.runtime.sendMessage(
    {
      target: "background",
      type: "OFFSCREEN_STATE",
      state,
    },
    () => {
      void chrome.runtime.lastError;
    }
  );
}

function waitForNextFrame() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
