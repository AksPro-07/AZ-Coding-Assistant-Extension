let AI_API_KEY = "";

/**
 * A simple, stateless function to get the API key.
 * It checks if the key is loaded in memory; if not, it fetches it.
 * @returns {Promise<string>} A promise that resolves with the API key.
 */
async function getApiKey() {
  // If key is already in memory, return it instantly.
  if (AI_API_KEY) {
    return AI_API_KEY;
  }

  // If key is not in memory (e.g., worker just woke up), fetch it.
  try {
    const response = await fetch(chrome.runtime.getURL("config.json"));
    const config = await response.json();
    if (config.AI_API_KEY) {
      AI_API_KEY = config.AI_API_KEY;
      return AI_API_KEY;
    } else {
      throw new Error("AI_API_KEY not found in config.json");
    }
  } catch (error) {
    console.error("Failed to load API key:", error);
    // Return null or throw to indicate failure
    throw error;
  }
}

// Listen for AI completion requests.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_AI_COMPLETION") {
    
    // Use an async IIFE to handle the logic.
    (async () => {
      try {
        // 1. Get the API key. This will fetch it if the worker was asleep.
        const apiKey = await getApiKey();

        // 2. Proceed with the API call.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const requestBody = { contents: request.payload.messages };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (data.error) {
          console.error("Google API Error:", data.error);
          sendResponse({ success: false, error: data.error.message });
        } else {
          sendResponse({ success: true, data });
        }
      } catch (error) {
        console.error("Error processing AI request in background:", error.message);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true; // Keep the message channel open for the async response.
  }
});
