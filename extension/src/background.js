// ------------------------------
// Create context menu on install
// ------------------------------
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "Translate with AI Translator",
    contexts: ["selection"]
  });
});

// ------------------------------
// Handle context menu click
// ------------------------------
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "translate-selection") return;

  // ❌ Prevent chrome:// errors
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "AI Translator",
      message: "Cannot translate text on chrome:// or system pages."
    });
    return;
  }

  const popupUrl =
    chrome.runtime.getURL("popup.html") +
    "?text=" +
    encodeURIComponent(info.selectionText);

  chrome.windows.create({
    url: popupUrl,
    type: "popup",
    width: 420,
    height: 600
  });
});

// ------------------------------
// Handle messages from popup
// ------------------------------
chrome.runtime.onMessage.addListener((message, sender) => {
  // FULL PAGE TRANSLATION
  if (message.action === "translatePage") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs.length) return;

      const tabId = tabs[0].id;

      // ❌ Prevent chrome:// page errors
      if (tabs[0].url.startsWith("chrome://") || tabs[0].url.startsWith("edge://")) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "AI Translator",
          message: "Cannot translate chrome:// or system pages."
        });
        return;
      }

      console.log("[Background] Injecting pageTranslate script, targetLang:", message.targetLang);

      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ["src/content/pageTranslate.js"] 
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error("[Background] Script injection error:", chrome.runtime.lastError);
            return;
          }
          
          // Wait a bit for the script to register its message listener
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              action: "START_FULL_TRANSLATE",
              targetLang: message.targetLang
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("[Background] Message send error:", chrome.runtime.lastError);
              } else {
                console.log("[Background] Message sent successfully");
              }
            });
          }, 100);
        }
      );
    });
  }

  // YOUTUBE AUTO TRANSLATE TOGGLE
  if (message.action === "toggleYoutube") {
    chrome.storage.local.set({ youtubeEnabled: message.enabled });

    if (message.enabled) {
      chrome.tabs.query({ url: "*://*.youtube.com/watch*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/content/youtubeTranslate.js"]
          }, (results) => {
            if (chrome.runtime.lastError) {
              console.error("[Background] YouTube script injection error:", chrome.runtime.lastError);
            }
          });
        });
      });
    } else {
      chrome.tabs.query({ url: "*://*.youtube.com/watch*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { action: "DISABLE_YT_TRANSLATION" }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("[Background] YouTube disable message error:", chrome.runtime.lastError);
            }
          });
        });
      });
    }
  }
});

// --------------------------------------
// Auto-inject YouTube script on navigation
// --------------------------------------
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== "complete") return;

  if (!tab.url || tab.url.startsWith("chrome://")) return;

  if (tab.url.includes("youtube.com/watch")) {
    chrome.storage.local.get(["youtubeEnabled"], (data) => {
      if (!data.youtubeEnabled) return;

      chrome.scripting.executeScript({
        target: { tabId },
        files: ["src/content/youtubeTranslate.js"]
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error("[Background] YouTube auto-inject error:", chrome.runtime.lastError);
        } else {
          console.log("[Background] YouTube script auto-injected");
        }
      });
    });
  }
});
