// Content script for translating the entire page

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action !== "START_FULL_TRANSLATE") return;

  const targetLang = message.targetLang;

  console.log("[AI Translator] Starting full page translation →", targetLang);

  const originalHTML = document.documentElement.outerHTML;

  try {
    console.log("[AI Translator] Sending HTML for translation, targetLang:", targetLang);
    
    // Send full HTML to backend
    const res = await fetch("http://localhost:5001/translateHtml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: originalHTML, targetLang })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      // Handle limit errors 
      if (res.status === 402) {
        throw new Error(errorData.message || "Translation limit reached. Please upgrade your Lingo.dev plan.");
      }
      throw new Error(errorData.message || errorData.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log("[AI Translator] Received translation response");
    
    if (!data || !data.translatedHtml) {
      throw new Error("Invalid response from server");
    }

    const translated = data.translatedHtml;

    // Replace main HTML
    document.documentElement.innerHTML = translated;

    console.log("[AI Translator] Page replaced with translated HTML");

    // ------- Dynamic observer for SPA / ajax pages -------
    const debounce = (fn, delay = 500) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
      };
    };

    const translateNode = debounce(async (node) => {
      if (!node || !node.textContent) return;

      const clean = node.textContent.trim();
      if (!clean) return;

      const res = await fetch("http://localhost:5001/translateText", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean, targetLang })
      });

      if (!res.ok) {
        console.error("[AI Translator] Translation error:", res.status);
        return;
      }

      const out = await res.json();
      if (out && out.translated) {
        node.textContent = out.translated;
      }
    }, 400);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const added of m.addedNodes) {
          if (added.nodeType === Node.TEXT_NODE) {
            translateNode(added);
          } else if (added.nodeType === Node.ELEMENT_NODE) {
            const texts = added.querySelectorAll("*");
            texts.forEach((el) => {
              if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                translateNode(el.childNodes[0]);
              }
            });
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("[AI Translator] Mutation observer activated.");

  } catch (err) {
    console.error("[AI Translator] Full page translation failed:", err);
    alert(`Translation failed: ${err.message || "Unknown error. Make sure the backend server is running on http://localhost:5001"}`);
  }
});
