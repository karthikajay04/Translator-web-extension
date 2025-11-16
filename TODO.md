# TODO: Add Page Translation and YouTube Auto-Translate Features

## Steps to Complete

- [x] Update backend/server.js: Add /translateText and /translateHtml endpoints.
- [x] Update extension/src/popup/App.jsx: Add "Translate This Page" button, "Enable YouTube Auto Translate" toggle, ensure targetLang selector is accessible.
- [x] Update extension/src/background.js: Handle messages for page translation (inject content script), and for YouTube auto-translate (inject YouTube content script when enabled).
- [x] Create extension/src/content/pageTranslate.js: Content script for translating entire page HTML, with MutationObserver.
- [x] Create extension/src/content/youtubeTranslate.js: Content script for YouTube captions overlay.
- [x] Update extension/manifest.json: Add necessary permissions for scripting, host_permissions for youtube.com and localhost.
- [x] Test the extension: Build, load, test page translation button, test YouTube toggle and captions.

## Progress Tracking
- Start with backend updates.
- Then popup UI.
- Background script and content scripts.
- Manifest permissions.
- Update this file after each step completion.
