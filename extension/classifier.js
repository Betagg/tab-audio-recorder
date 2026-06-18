(function () {
  const CATEGORY_ORDER = ["Meeting", "Lecture", "Podcast", "Music", "Video", "Audio"];
  const SIGNAL_VERSION = "2";

  const DOMAIN_RULES = [
    ["Meeting", 110, /(^|\.)meet\.google\.com$/, "Google Meet domain"],
    ["Meeting", 105, /(^|\.)zoom\.us$/, "Zoom domain"],
    ["Meeting", 100, /(^|\.)teams\.microsoft\.com$/, "Microsoft Teams domain"],
    ["Meeting", 95, /(^|\.)webex\.com$/, "Webex domain"],
    ["Meeting", 90, /(^|\.)whereby\.com$/, "Whereby domain"],
    ["Meeting", 85, /(^|\.)around\.co$/, "Around domain"],
    ["Meeting", 70, /(^|\.)gotomeeting\.com$/, "GoTo Meeting domain"],

    ["Lecture", 100, /(^|\.)coursera\.org$/, "Coursera domain"],
    ["Lecture", 95, /(^|\.)udemy\.com$/, "Udemy domain"],
    ["Lecture", 95, /(^|\.)edx\.org$/, "edX domain"],
    ["Lecture", 90, /(^|\.)khanacademy\.org$/, "Khan Academy domain"],
    ["Lecture", 85, /(^|\.)udacity\.com$/, "Udacity domain"],
    ["Lecture", 80, /(^|\.)brilliant\.org$/, "Brilliant domain"],
    ["Lecture", 75, /(^|\.)classcentral\.com$/, "Class Central domain"],
    ["Lecture", 75, /(^|\.)canvaslms\.com$/, "Canvas domain"],
    ["Lecture", 75, /(^|\.)instructure\.com$/, "Canvas domain"],
    ["Lecture", 75, /(^|\.)blackboard\.com$/, "Blackboard domain"],
    ["Lecture", 70, /(^|\.)moodle\./, "Moodle domain"],

    ["Podcast", 105, /(^|\.)podcasts\.apple\.com$/, "Apple Podcasts domain"],
    ["Podcast", 100, /(^|\.)pocketcasts\.com$/, "Pocket Casts domain"],
    ["Podcast", 95, /(^|\.)overcast\.fm$/, "Overcast domain"],
    ["Podcast", 95, /(^|\.)podcasts\.google\.com$/, "Google Podcasts domain"],
    ["Podcast", 90, /(^|\.)castbox\.fm$/, "Castbox domain"],
    ["Podcast", 90, /(^|\.)podbean\.com$/, "Podbean domain"],
    ["Podcast", 90, /(^|\.)simplecast\.com$/, "Simplecast domain"],
    ["Podcast", 90, /(^|\.)transistor\.fm$/, "Transistor domain"],
    ["Podcast", 90, /(^|\.)libsyn\.com$/, "Libsyn domain"],
    ["Podcast", 85, /(^|\.)anchor\.fm$/, "Anchor domain"],
    ["Podcast", 80, /(^|\.)lennyspodcast\.com$/, "Podcast domain"],

    ["Music", 95, /(^|\.)music\.youtube\.com$/, "YouTube Music domain"],
    ["Music", 90, /(^|\.)bandcamp\.com$/, "Bandcamp domain"],
    ["Music", 90, /(^|\.)tidal\.com$/, "Tidal domain"],
    ["Music", 85, /(^|\.)deezer\.com$/, "Deezer domain"],
    ["Music", 85, /(^|\.)pandora\.com$/, "Pandora domain"],
    ["Music", 80, /(^|\.)soundcloud\.com$/, "SoundCloud domain"],

    ["Video", 45, /(^|\.)youtube\.com$/, "YouTube domain"],
    ["Video", 45, /(^|\.)youtu\.be$/, "YouTube domain"],
    ["Video", 55, /(^|\.)vimeo\.com$/, "Vimeo domain"],
    ["Video", 75, /(^|\.)twitch\.tv$/, "Twitch domain"],
    ["Video", 70, /(^|\.)netflix\.com$/, "Netflix domain"],
    ["Video", 70, /(^|\.)hulu\.com$/, "Hulu domain"],
  ];

  const TEXT_RULES = [
    ["Meeting", 55, /\b(meeting|standup|sync|all[-\s]?hands|town hall|retro|1[:\s-]?1|one[-\s]?on[-\s]?one)\b/i, "meeting language"],
    ["Meeting", 45, /\b(google meet|zoom call|teams call|webex|conference call|product sync|weekly sync)\b/i, "call language"],
    ["Meeting", 35, /\b(webinar|work session|office hours)\b/i, "live session language"],

    ["Lecture", 60, /\b(lecture|lesson|course|class|module|curriculum|assignment|homework|professor|university)\b/i, "learning language"],
    ["Lecture", 50, /\b(tutorial|workshop|seminar|masterclass|bootcamp|online learning|mooc)\b/i, "instructional language"],
    ["Lecture", 45, /\b(stanford|mit opencourseware|harvard|yale|berkeley|machine learning course)\b/i, "education source"],

    ["Podcast", 65, /\b(podcast|podcasts|episode|season)\b/i, "podcast language"],
    ["Podcast", 55, /\b(interview|conversation with|fireside chat|the .{2,40} show)\b/i, "interview/show language"],
    ["Podcast", 45, /\b(listen now|show notes|rss feed|subscribe to this podcast)\b/i, "podcast page language"],

    ["Music", 60, /\b(song|album|single|artist|playlist|discography|track|lyrics|remix|soundtrack)\b/i, "music language"],
    ["Music", 45, /\b(official audio|music video|live session|dj set|mix tape|mixtape)\b/i, "music release language"],

    ["Video", 50, /\b(video|watch|trailer|clip|vlog|highlights|livestream|stream replay|gameplay)\b/i, "video language"],
    ["Video", 20, /\b(youtube|vimeo|twitch)\b/i, "video platform language"],
  ];

  const PATH_RULES = [
    ["Meeting", 50, /\/(meeting|meet|call|conference|webinar)(\/|$)/i, "meeting URL path"],
    ["Lecture", 55, /\/(course|courses|learn|lesson|lecture|class|module|training)(\/|$)/i, "learning URL path"],
    ["Podcast", 60, /\/(podcast|podcasts|episode|episodes|show|shows)(\/|$)/i, "podcast URL path"],
    ["Music", 55, /\/(track|album|artist|playlist|song)(\/|$)/i, "music URL path"],
    ["Video", 25, /\/(watch|video|videos|live|stream|clip)(\/|$)/i, "video URL path"],
  ];

  const JSON_LD_TYPE_RULES = [
    ["Podcast", 100, /\b(PodcastEpisode|PodcastSeries)\b/i, "Podcast structured data"],
    ["Music", 100, /\b(MusicRecording|MusicAlbum|MusicPlaylist|MusicGroup)\b/i, "Music structured data"],
    ["Lecture", 90, /\b(Course|LearningResource|EducationalOccupationalProgram)\b/i, "Course structured data"],
    ["Video", 65, /\b(VideoObject|Movie|TVEpisode)\b/i, "Video structured data"],
    ["Audio", 45, /\b(AudioObject)\b/i, "Audio structured data"],
    ["Meeting", 35, /\b(Event)\b/i, "Event structured data"],
  ];

  const OG_TYPE_RULES = [
    ["Music", 85, /^music\./i, "Open Graph music type"],
    ["Video", 35, /^video\./i, "Open Graph video type"],
    ["Audio", 45, /^audio\./i, "Open Graph audio type"],
    ["Podcast", 30, /^article$/i, "article with podcast cues"],
  ];

  function buildRecordingMetadata(tabInfo, pageSignals = {}, timestamp = Date.now()) {
    const normalized = normalizeSignals(tabInfo, pageSignals);
    const classification = classifyRecording(normalized);
    const suggestedFilename = suggestFilename(
      normalized,
      classification.category,
      timestamp
    );

    return {
      title: normalized.title,
      url: normalized.url,
      hostname: normalized.hostname,
      siteName: normalized.siteName,
      category: classification.category,
      classificationConfidence: classification.confidence,
      classificationReason: classification.reason,
      classificationScores: classification.scores,
      startedAt: timestamp,
      suggestedFilename,
      signalsVersion: SIGNAL_VERSION,
    };
  }

  function normalizeSignals(tabInfo = {}, pageSignals = {}) {
    const url = safeUrl(pageSignals.url || tabInfo.url || "");
    const hostname =
      cleanHostname(pageSignals.hostname || tabInfo.hostname || url.hostname) ||
      "browser-tab";
    const title = cleanTitle(
      pageSignals.ogTitle ||
        pageSignals.jsonLdHeadline ||
        pageSignals.title ||
        tabInfo.title ||
        "Untitled tab",
      hostname
    );
    const siteName =
      pageSignals.ogSiteName || pageSignals.applicationName || hostname;

    return {
      title,
      rawTitle: pageSignals.title || tabInfo.title || title,
      description: pageSignals.description || "",
      keywords: pageSignals.keywords || "",
      url: url.href || tabInfo.url || "",
      hostname,
      pathname: url.pathname || "",
      siteName,
      ogType: pageSignals.ogType || "",
      jsonLdTypes: pageSignals.jsonLdTypes || [],
      jsonLdHeadline: pageSignals.jsonLdHeadline || "",
      headings: pageSignals.headings || [],
      audioCount: pageSignals.audioCount || 0,
      videoCount: pageSignals.videoCount || 0,
      playingMediaCount: pageSignals.playingMediaCount || 0,
      durationHints: pageSignals.durationHints || [],
    };
  }

  function classifyRecording(signals) {
    const scores = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, 0]));
    const reasons = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, []]));

    const add = (category, points, reason) => {
      scores[category] += points;
      if (reason && reasons[category].length < 4) {
        reasons[category].push(reason);
      }
    };

    const host = signals.hostname.toLowerCase();
    const fullText = [
      signals.hostname,
      signals.siteName,
      signals.title,
      signals.rawTitle,
      signals.description,
      signals.keywords,
      signals.ogType,
      signals.jsonLdHeadline,
      signals.headings.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    for (const [category, points, pattern, reason] of DOMAIN_RULES) {
      if (pattern.test(host)) {
        add(category, points, reason);
      }
    }

    applyPlatformSpecificRules(signals, add);

    for (const [category, points, pattern, reason] of TEXT_RULES) {
      if (pattern.test(fullText)) {
        add(category, points, reason);
      }
    }

    for (const [category, points, pattern, reason] of PATH_RULES) {
      if (pattern.test(signals.pathname)) {
        add(category, points, reason);
      }
    }

    for (const type of signals.jsonLdTypes) {
      for (const [category, points, pattern, reason] of JSON_LD_TYPE_RULES) {
        if (pattern.test(type)) {
          add(category, points, reason);
        }
      }
    }

    for (const [category, points, pattern, reason] of OG_TYPE_RULES) {
      if (pattern.test(signals.ogType)) {
        add(category, points, reason);
      }
    }

    if (signals.audioCount > 0) {
      add("Audio", Math.min(30, 10 + signals.audioCount * 5), "audio elements on page");
    }
    if (signals.videoCount > 0) {
      add("Video", Math.min(25, 8 + signals.videoCount * 4), "video elements on page");
    }
    if (signals.playingMediaCount > 0) {
      add("Audio", 12, "media currently playing");
    }

    const ranked = CATEGORY_ORDER
      .map((category) => ({ category, score: scores[category] }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      });

    const winner = ranked[0];
    const runnerUp = ranked[1];

    if (winner.score < 25) {
      return {
        category: "Audio",
        confidence: 45,
        reason: "No strong category signals",
        scores,
      };
    }

    const confidence = computeConfidence(winner.score, runnerUp.score);
    return {
      category: winner.category,
      confidence,
      reason: reasons[winner.category][0] || "best matching signals",
      scores,
    };
  }

  function applyPlatformSpecificRules(signals, add) {
    const host = signals.hostname.toLowerCase();
    const path = signals.pathname.toLowerCase();
    const text = `${signals.url} ${signals.title} ${signals.description}`.toLowerCase();

    if (host === "open.spotify.com") {
      if (/\/(show|episode)\//.test(path) || /\bpodcast\b/.test(text)) {
        add("Podcast", 95, "Spotify podcast path");
      } else if (/\/(track|album|artist|playlist)\//.test(path)) {
        add("Music", 95, "Spotify music path");
      } else {
        add("Music", 55, "Spotify domain");
      }
    }

    if (host.endsWith("apple.com")) {
      if (/\/podcast/i.test(path) || /\bpodcast\b/.test(text)) {
        add("Podcast", 95, "Apple Podcasts path");
      }
      if (/\/music/i.test(path)) {
        add("Music", 90, "Apple Music path");
      }
    }

    if (host.endsWith("youtube.com") || host === "youtu.be") {
      if (/\b(podcast|episode|interview|conversation with|show notes)\b/.test(text)) {
        add("Podcast", 105, "YouTube podcast cues");
      }
      if (/\b(lecture|lesson|course|tutorial|university|stanford|mit|class)\b/.test(text)) {
        add("Lecture", 100, "YouTube learning cues");
      }
      if (/\b(song|album|official audio|lyrics|remix|playlist)\b/.test(text)) {
        add("Music", 95, "YouTube music cues");
      }
    }

    if (host.endsWith("soundcloud.com") && /\b(podcast|episode|interview)\b/.test(text)) {
      add("Podcast", 65, "SoundCloud podcast cues");
    }
  }

  function computeConfidence(bestScore, secondScore) {
    const gap = Math.max(0, bestScore - secondScore);
    const scorePart = Math.min(35, bestScore * 0.28);
    const gapPart = Math.min(22, gap * 0.35);
    return clamp(Math.round(45 + scorePart + gapPart), 50, 97);
  }

  function suggestFilename(signals, category, timestamp) {
    const date = formatLocalDate(timestamp);
    const title = stripMediaTitlePrefix(
      signals.title || cleanTitle(signals.rawTitle, signals.hostname)
    );
    const source = slugify(title) || slugify(signals.siteName) || slugify(signals.hostname);
    return `${source || "tab-audio"}-${date}.mp3`;
  }

  function cleanTitle(title, hostname) {
    const value = String(title || "")
      .replace(/\s+/g, " ")
      .replace(/\s+\(\d+\)\s*$/, "")
      .trim();
    return stripSiteSuffix(value, hostname);
  }

  function stripSiteSuffix(title, hostname) {
    if (!title) {
      return "";
    }

    const hostParts = String(hostname || "").split(".");
    const site = hostParts.length > 1 ? hostParts[hostParts.length - 2] : hostParts[0];
    const sitePattern = escapeRegExp(site || "");

    return title
      .replace(/\s+[-|•·]\s+[^-|•·]+$/u, "")
      .replace(new RegExp(`\\s+[-|•·]\\s+${sitePattern}$`, "iu"), "")
      .trim();
  }

  function stripMediaTitlePrefix(value) {
    return String(value || "")
      .replace(
        /^(audio|lecture|meeting|music|podcast|video)(?:\s*[-_:|•·]\s*|\s+|$)/iu,
        ""
      )
      .trim();
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72);
  }

  function formatLocalDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function cleanHostname(hostname) {
    return String(hostname || "").replace(/^www\./, "").toLowerCase();
  }

  function safeUrl(value) {
    try {
      return new URL(value || "https://browser-tab.local/");
    } catch {
      return new URL("https://browser-tab.local/");
    }
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  globalThis.TabAudioClassifier = {
    buildRecordingMetadata,
    classifyRecording,
    normalizeSignals,
    suggestFilename,
  };
})();
