// YouTube auto-translate content script

let overlay = null;
let lastCaption = "";
let enabled = true;


// Create subtitle overlay

function createOverlay() {
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "ai-yt-caption";
  overlay.style.position = "absolute";
  overlay.style.bottom = "60px";
  overlay.style.left = "50%";
  overlay.style.transform = "translateX(-50%)";
  overlay.style.padding = "8px 14px";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.color = "white";
  overlay.style.fontSize = "20px";
  overlay.style.borderRadius = "6px";
  overlay.style.textShadow = "0 0 5px black";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "999999";
  overlay.style.display = "none";

  const player = document.querySelector(".html5-video-player") || document.body;
  player.appendChild(overlay);

  return overlay;
}

function removeOverlay() {
  enabled = false;
  if (overlay) overlay.remove();
  overlay = null;
  lastCaption = "";
}


// Caption Observer

const debouncedTranslate = (() => {
  let t;
  return (fn) => {
    clearTimeout(t);
    t = setTimeout(fn, 120);
  };
})();

async function handleCaption(text, lang) {
  if (!text || text === lastCaption) return;

  lastCaption = text;

  try {
    console.log("[YT Translator] Translating caption:", text.substring(0, 50), "to", lang);
    
    const res = await fetch("http://localhost:5001/translateText", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data || !data.translated) {
      throw new Error("Invalid response from server");
    }

    const o = createOverlay();
    o.textContent = data.translated;
    o.style.display = "block";

  } catch (err) {
    console.error("[YT Translator] Caption error:", err);
    // Don't show error to user for YouTube captions, just log it
  }
}

function observeCaptions(lang) {
  const observer = new MutationObserver((mut) => {
    if (!enabled) return;

    debouncedTranslate(() => {
      const el = document.querySelector(".ytp-caption-segment");
      if (!el) return;

      const text = el.innerText.trim();
      handleCaption(text, lang);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}


// MESSAGE HANDLERS
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "DISABLE_YT_TRANSLATION") {
    removeOverlay();
  }
});

// Language mapping utility
function getLocaleCode(languageName) {
  const map = {
    "English": "en",
    "Hindi": "hi",
    "Tamil": "ta",
    "Telugu": "te",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Spanish": "es",
    "French": "fr"
  };
  // If it's already a locale code (2-3 chars), return as is
  if (languageName && languageName.length <= 3 && !map[languageName]) {
    return languageName;
  }
  return map[languageName] || "en";
}

// Auto-enable when injected
chrome.storage.local.get(["youtubeEnabled", "targetLang"], (res) => {
  if (!res.youtubeEnabled) return;
  const langName = res.targetLang || "English";
  const lang = getLocaleCode(langName);

  enabled = true;
  createOverlay();
  observeCaptions(lang);

  console.log("[AI Translator] YouTube auto-translate enabled.");
});
