import React, { useEffect, useState } from "react";
import { getLocaleCode, getLanguageName, LANGUAGE_MAP } from "../utils/languageMap";

const LANGS = ["English","Hindi","Tamil","Telugu","Kannada","Malayalam","Spanish","French"];
const MOODS = ["neutral", "happy", "sad", "excited"];

export default function App(){
  const [activeTab, setActiveTab] = useState("translate");
  const [text, setText] = useState("");
  const [target, setTarget] = useState("English");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState("");
  const [history, setHistory] = useState([]);
  const [genInput, setGenInput] = useState("");
  const [genMood, setGenMood] = useState("neutral");
  const [genOutput, setGenOutput] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [youtubeEnabled, setYoutubeEnabled] = useState(false);

  // Load settings from chrome.storage
  useEffect(() => {
    chrome.storage.local.get(["history", "youtubeEnabled", "targetLang"], (res) => {
      setHistory(res.history || []);
      setYoutubeEnabled(res.youtubeEnabled || false);
      if (res.targetLang) setTarget(res.targetLang);
    });

    // Handle URL parameter for context menu selection
    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get("text");
    if (textParam) {
      setText(decodeURIComponent(textParam));
    }
  }, []);

  // Save target language whenever changed
  useEffect(() => {
    chrome.storage.local.set({ targetLang: target });
  }, [target]);

  // Backend: detect language
  async function detectLanguage(txt){
    try{
      const res = await fetch("http://localhost:5001/detect", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text: txt })
      });
      const data = await res.json();
      return data.language || "";
    }catch(e){
      return "";
    }
  }

  // Text translation
  async function translate(){
    if (!text || !text.trim()) {
      setOutput("Please enter some text to translate.");
      return;
    }

    setLoading(true);
    setOutput("");
    try{
      const detectedLang = await detectLanguage(text);
      // Convert locale code to language name for display
      const detectedLangName = getLanguageName(detectedLang) || detectedLang;
      setDetected(detectedLangName);

      const localeCode = getLocaleCode(target);
      console.log("[Translate] Sending request:", { text: text.substring(0, 50), language: localeCode });
      
      const res = await fetch("http://localhost:5001/translate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text, language: localeCode })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Handle payment/limit errors specifically
        if (res.status === 402) {
          throw new Error(errorData.message || "Translation limit reached. Please upgrade your Lingo.dev plan.");
        }
        throw new Error(errorData.message || errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("[Translate] Response:", data);
      
      if (!data || !data.translated) {
        throw new Error("Invalid response from server");
      }

      setOutput(data.translated);

      // Save to history
      const item = { 
        id: Date.now(), 
        text, 
        target, 
        detected: detectedLangName, 
        translated: data.translated, 
        at: new Date().toISOString() 
      };
      const newHist = [item, ...history].slice(0, 50);
      setHistory(newHist);

      chrome.storage.local.set({ history: newHist });
    }
    catch(err){
      console.error("[Translate] Error:", err);
      setOutput(`Error: ${err.message || "Couldn't reach backend. Make sure the server is running on http://localhost:5001"}`);
    }
    finally{
      setLoading(false);
    }
  }

  // Full Page Translation
  function translatePage(){
    const localeCode = getLocaleCode(target);
    chrome.runtime.sendMessage({ 
      action: "translatePage", 
      targetLang: localeCode 
    });
  }

  // YouTube Auto Translate Toggle
  function toggleYoutube(){
    const newValue = !youtubeEnabled;
    setYoutubeEnabled(newValue);

    chrome.storage.local.set({ youtubeEnabled: newValue });

    chrome.runtime.sendMessage({ 
      action: "toggleYoutube", 
      enabled: newValue 
    });
  }

  // Generate (AI)
  async function generate(){
    setGenLoading(true);
    setGenOutput("");

    try{
      const res = await fetch("http://localhost:5001/api/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text: genInput, mood: genMood })
      });

      const data = await res.json();
      setGenOutput(data.generated);
    }
    catch(err){
      setGenOutput("Error: couldn't reach backend.");
    }
    finally{
      setGenLoading(false);
    }
  }

  // Utility buttons
  function speak(){
    if(!output) return;
    const utter = new SpeechSynthesisUtterance(output);
    speechSynthesis.speak(utter);
  }

  function copyOutput(){
    navigator.clipboard.writeText(output).then(()=> {
      alert("Copied to clipboard");
    });
  }

  function clearHistory(){
    setHistory([]);
    chrome.storage.local.set({ history: [] });
  }

  // UI
  return (
    <div className="p-4 w-96 font-sans bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-800">AI Extension</h2>

      {/* GLOBAL CONTROLS */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-indigo-700">Target Language:</label>
          <select 
            className="border-2 border-indigo-200 rounded p-1 text-sm" 
            value={target} 
            onChange={e => setTarget(e.target.value)}
          >
            {LANGS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors text-sm" 
            onClick={translatePage}
          >
            Translate This Page
          </button>
        </div>

        <div className="flex items-center mt-2">
          <input 
            type="checkbox" 
            id="youtubeToggle" 
            checked={youtubeEnabled} 
            onChange={toggleYoutube} 
            className="mr-2" 
          />
          <label htmlFor="youtubeToggle" className="text-sm text-indigo-700">
            Enable YouTube Auto Translate
          </label>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex mb-4 border-b">
        <button
          className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'translate' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('translate')}
        >
          Translate
        </button>

        <button
          className={`flex-1 py-2 px-4 text-center font-medium ${activeTab === 'generate' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate
        </button>
      </div>

      {/* TRANSLATE TAB */}
      {activeTab === 'translate' && (
        <>
          <h3 className="text-lg font-semibold mb-2 text-indigo-700">Translate Text</h3>

          <textarea 
            className="w-full border-2 border-indigo-200 rounded-lg p-3 shadow-sm" 
            rows="5" 
            placeholder="Paste text here" 
            value={text} 
            onChange={e => setText(e.target.value)} 
          />

          <div className="flex gap-2 mt-3">
            <button 
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md" 
              onClick={translate} 
              disabled={loading || !text}
            >
              {loading ? "Translating..." : "Translate"}
            </button>
          </div>

          <div className="mt-4 p-4 border-2 border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 min-h-[80px] shadow-sm">
            <div className="text-sm font-medium text-indigo-600">Detected: {detected || "—"}</div>
            <div className="mt-2 text-gray-800">{output || "Translation will appear here."}</div>
          </div>

          <div className="flex gap-2 mt-3">
            <button className="flex-1 px-4 py-2 border-2 border-indigo-200 rounded-lg" onClick={speak} disabled={!output}>🔊 Listen</button>
            <button className="px-4 py-2 border-2 border-indigo-200 rounded-lg" onClick={copyOutput} disabled={!output}>📋 Copy</button>
          </div>

          {/* HISTORY */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-indigo-700">History</h3>
              <button className="text-sm text-red-600 hover:text-red-800" onClick={clearHistory}>Clear</button>
            </div>

            <div className="max-h-40 overflow-auto mt-2 space-y-2">
              {history.length===0 && <div className="text-sm text-gray-500">No history yet.</div>}

              {history.map(h => (
                <div key={h.id} className="p-3 border-2 border-indigo-100 rounded-lg bg-white shadow-sm">
                  <div className="text-sm text-gray-600">{new Date(h.at).toLocaleString()}</div>
                  <div className="text-sm font-medium text-indigo-600"><strong>{h.detected} → {h.target}</strong></div>
                  <div className="text-sm truncate text-gray-700">{h.text}</div>
                  <div className="text-sm mt-1 text-gray-800">{h.translated}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <>
          <h3 className="text-lg font-semibold mb-2 text-indigo-700">Generate Text</h3>

          <textarea 
            className="w-full border-2 border-indigo-200 rounded-lg p-3 shadow-sm" 
            rows="5" 
            placeholder="Enter prompt here" 
            value={genInput}
            onChange={e => setGenInput(e.target.value)}
          />

          <div className="flex gap-2 mt-3">
            <select 
              className="flex-1 border-2 border-indigo-200 rounded-lg p-3 shadow-sm" 
              value={genMood} 
              onChange={e => setGenMood(e.target.value)}
            >
              {MOODS.map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>

            <button 
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md" 
              onClick={generate} 
              disabled={genLoading || !genInput}
            >
              {genLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          <div className="mt-4 p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 min-h-[80px] shadow-sm">
            <div className="text-gray-800">{genOutput || "Generated text will appear here."}</div>
          </div>
        </>
      )}
    </div>
  );
}
