const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "extension", "classifier.js"),
  "utf8"
);
const sandbox = { globalThis: {}, URL };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const classifier = sandbox.globalThis.TabAudioClassifier;
const timestamp = new Date("2026-06-14T12:00:00+08:00").getTime();

const cases = [
  {
    name: "Google Meet weekly sync",
    expected: "Meeting",
    tab: {
      title: "Weekly Product Sync - Google Meet",
      url: "https://meet.google.com/abc-defg-hij",
      hostname: "meet.google.com",
    },
    page: {
      title: "Weekly Product Sync",
      headings: ["Weekly Product Sync"],
    },
  },
  {
    name: "YouTube lecture beats video default",
    expected: "Lecture",
    tab: {
      title: "Stanford CS229 Lecture 1 - Machine Learning - YouTube",
      url: "https://www.youtube.com/watch?v=abc123",
      hostname: "youtube.com",
    },
    page: {
      ogType: "video.other",
      videoCount: 1,
      description: "Lecture from the Stanford machine learning course.",
    },
  },
  {
    name: "YouTube podcast beats video default",
    expected: "Podcast",
    tab: {
      title: "Lenny's Podcast: AI Agents with Sarah - YouTube",
      url: "https://www.youtube.com/watch?v=pod123",
      hostname: "youtube.com",
    },
    page: {
      ogType: "video.other",
      description: "Full podcast episode with show notes and transcript.",
      videoCount: 1,
    },
  },
  {
    name: "Spotify episode is podcast",
    expected: "Podcast",
    tab: {
      title: "AI Agents and the Future of Product",
      url: "https://open.spotify.com/episode/123",
      hostname: "open.spotify.com",
    },
    page: {
      description: "Podcast episode from a technology show.",
      audioCount: 1,
    },
  },
  {
    name: "Spotify track is music",
    expected: "Music",
    tab: {
      title: "A Real Song",
      url: "https://open.spotify.com/track/123",
      hostname: "open.spotify.com",
    },
    page: {
      description: "Track from an album by an artist.",
      audioCount: 1,
    },
  },
  {
    name: "Coursera course is lecture",
    expected: "Lecture",
    tab: {
      title: "Neural Networks and Deep Learning",
      url: "https://www.coursera.org/learn/neural-networks-deep-learning",
      hostname: "coursera.org",
    },
    page: {
      jsonLdTypes: ["Course"],
      headings: ["Neural Networks and Deep Learning"],
    },
  },
  {
    name: "Video label is stripped from filename",
    expected: "Video",
    tab: {
      title: "Video - I Built a Marketing Team with 1 AI Agent - YouTube",
      url: "https://www.youtube.com/watch?v=abc123",
      hostname: "youtube.com",
    },
    page: {
      ogType: "video.other",
      videoCount: 1,
    },
  },
];

for (const item of cases) {
  const metadata = classifier.buildRecordingMetadata(item.tab, item.page, timestamp);
  assert.equal(
    metadata.category,
    item.expected,
    `${item.name}: expected ${item.expected}, got ${metadata.category}`
  );
  assert(
    metadata.classificationConfidence >= 70,
    `${item.name}: expected high confidence, got ${metadata.classificationConfidence}`
  );
  assert(
    metadata.suggestedFilename.endsWith(".mp3"),
    `${item.name}: expected MP3 filename`
  );
  assert(
    !/^(audio|lecture|meeting|music|podcast|video)-/i.test(metadata.suggestedFilename),
    `${item.name}: filename should not include category prefix`
  );
}

const chinese = classifier.buildRecordingMetadata(
  {
    title: "机器学习课程 第一讲 - 视频",
    url: "https://example.edu/course/ml/lecture-1",
    hostname: "example.edu",
  },
  {
    description: "在线课程 lecture",
  },
  timestamp
);

assert.equal(chinese.category, "Lecture");
assert(
  chinese.suggestedFilename.includes("机器学习课程"),
  "Expected Unicode title text to be preserved in filename"
);

console.log("Classifier tests passed.");
