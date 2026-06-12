/* Ambiance musicale — playlist calme (Mixkit, libre de droits) */

const MUSIC = {
  storageKey: "salma_jewelry_music",
  volume: 0.22,
  playlist: [
    {
      title: "Serene View",
      src: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
    },
    {
      title: "Valley Sunset",
      src: "https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3",
    },
    {
      title: "Wedding",
      src: "https://assets.mixkit.co/music/preview/mixkit-wedding-01-657.mp3",
    },
    {
      title: "Beautiful Dream",
      src: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3",
    },
    {
      title: "Relax Beat",
      src: "https://assets.mixkit.co/music/preview/mixkit-relax-beat-292.mp3",
    },
  ],
};

let musicIndex = 0;
let musicPlaying = false;
let musicUnlocked = false;
let musicAudio = null;

function loadMusicPreference() {
  try {
    return localStorage.getItem(MUSIC.storageKey) !== "off";
  } catch (_) {
    return true;
  }
}

function saveMusicPreference(on) {
  try {
    localStorage.setItem(MUSIC.storageKey, on ? "on" : "off");
  } catch (_) {}
}

function setMusicUiState() {
  const btn = document.getElementById("musicToggle");
  const hint = document.getElementById("musicHint");
  if (!btn) return;

  btn.classList.toggle("is-playing", musicPlaying);
  btn.setAttribute("aria-label", musicPlaying ? "Couper la musique" : "Activer la musique");
  btn.setAttribute("aria-pressed", musicPlaying ? "true" : "false");

  if (hint) {
    const showHint = !musicPlaying && loadMusicPreference() && !musicUnlocked;
    hint.hidden = !showHint;
    hint.classList.toggle("is-visible", showHint);
  }
}

function loadCurrentTrack() {
  if (!musicAudio || !MUSIC.playlist.length) return;
  const track = MUSIC.playlist[musicIndex % MUSIC.playlist.length];
  musicAudio.src = track.src;
  musicAudio.load();
}

function playNextTrack() {
  if (!MUSIC.playlist.length) return;
  musicIndex = (musicIndex + 1) % MUSIC.playlist.length;
  loadCurrentTrack();
  if (musicPlaying) musicAudio.play().catch(() => {});
}

async function startMusic({ userInitiated = false } = {}) {
  if (!musicAudio || !loadMusicPreference()) return false;

  musicUnlocked = true;
  if (!musicAudio.src) loadCurrentTrack();

  try {
    await musicAudio.play();
    musicPlaying = true;
    setMusicUiState();
    return true;
  } catch (_) {
    if (userInitiated) {
      musicPlaying = false;
      setMusicUiState();
    }
    return false;
  }
}

function pauseMusic({ remember = true } = {}) {
  if (!musicAudio) return;
  musicAudio.pause();
  musicPlaying = false;
  if (remember) saveMusicPreference(false);
  setMusicUiState();
}

function resumeMusic() {
  saveMusicPreference(true);
  startMusic({ userInitiated: true });
}

function toggleMusic() {
  if (musicPlaying) {
    pauseMusic();
    return;
  }
  resumeMusic();
}

function bindMusicUnlockEvents() {
  const unlock = () => {
    if (musicPlaying || !loadMusicPreference()) return;
    startMusic({ userInitiated: true }).then((ok) => {
      if (ok) removeUnlockListeners();
    });
  };

  const removeUnlockListeners = () => {
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
    document.removeEventListener("scroll", unlock, { passive: true });
  };

  document.addEventListener("pointerdown", unlock, { once: false });
  document.addEventListener("keydown", unlock, { once: false });
  document.addEventListener("scroll", unlock, { once: false, passive: true });
}

function initSalmaMusic() {
  musicAudio = document.getElementById("siteMusic");
  if (!musicAudio || !MUSIC.playlist.length) return;

  musicAudio.volume = MUSIC.volume;
  musicAudio.preload = "auto";

  musicAudio.addEventListener("ended", playNextTrack);
  musicAudio.addEventListener("error", () => {
    if (MUSIC.playlist.length > 1) playNextTrack();
  });
  musicAudio.addEventListener("play", () => {
    musicPlaying = true;
    setMusicUiState();
  });
  musicAudio.addEventListener("pause", () => {
    if (!musicAudio.ended) {
      musicPlaying = false;
      setMusicUiState();
    }
  });

  document.getElementById("musicToggle")?.addEventListener("click", toggleMusic);
  document.getElementById("musicHintBtn")?.addEventListener("click", () => {
    resumeMusic();
  });

  loadCurrentTrack();
  setMusicUiState();

  if (loadMusicPreference()) {
    startMusic().then((ok) => {
      if (!ok) bindMusicUnlockEvents();
    });
  }
}
