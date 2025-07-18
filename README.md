# AZ Coding Assistant for maang.in

 

An intelligent Chrome extension that provides live, context-aware AI assistance to help users solve coding problems on the `maang.in` platform. The assistant is fully aware of the problem description, hints, solution approach, and the user's real-time code.

-----

## 🚀 Live Demo

*(This is the most important part of your README. Record a short GIF of the extension in action and replace the placeholder below. This is non-negotiable for a good portfolio\!)*

*A brief demonstration showing the "AI Help" button, the chatbox, a contextual conversation, and the "Clear Chat" functionality.*

-----

## ✨ Features

  * **Deep Context-Awareness**: The AI is provided with the full problem context (description, hints, constraints, solution approach) and the user's live code from the editor with every single query, ensuring highly relevant and accurate assistance.
  * **Live Code Sync**: Actively listens for changes to the user's code in the editor and instantly updates the AI's context, making it a true pair-programming partner.
  * **Robust Network Interception**: Bypasses complex authentication and CORS issues by intelligently intercepting the website's own successful network requests to capture data, ensuring 100% reliability.
  * **SPA-Proof UI**: Utilizes a persistent `MutationObserver` to ensure the "AI Help" button and chat interface remain functional and visible, even when the `maang.in` React application re-renders its components without a page reload.
  * **Intelligent & Safe AI**: Engineered with a robust system prompt that guides the AI to act as a tutor (providing hints before solutions) and safely handle off-topic or "jailbreak" attempts.
  * **Persistent, Per-Problem Chat History**: Saves conversation history for each unique problem, allowing users to pick up where they left off. Includes a "Clear Chat" feature for a fresh start.

-----

## 🏛️ Architectural Highlights & Challenges Overcome

This project's primary challenge was integrating with a live, secure, and dynamic Single Page Application.

1.  **The Authentication Problem:** Initial attempts to fetch problem data via direct API calls were consistently blocked by `401 Unauthorized` errors, even with correct permissions.

      * **Solution:** I pivoted to a more advanced architecture by injecting a script (`inject.js`) into the page's main world. This script wraps the native `fetch` and `XMLHttpRequest` functions to passively "sniff" the website's own successful, authenticated API calls. This resulted in a 100% reliable data pipeline.

2.  **The SPA Problem:** The React-based site frequently re-renders its DOM, which would wipe the extension's injected UI.

      * **Solution:** I implemented a `MutationObserver` in the main content script (`main.js`) that constantly watches the DOM. If it detects that the UI has been removed, it automatically re-injects it, creating a seamless and persistent user experience.

3.  **The AI Context Problem:** Initial prompt designs lost context in longer conversations.

      * **Solution:** I re-architected the prompt engineering. With every user message, the extension now dynamically reconstructs the *entire* context—including the full problem description, all hints, and the latest version of the user's code—and sends it to the Gemini API. This ensures the AI is always perfectly informed.

-----

## 🛠️ Tech Stack

  * **Core**: `JavaScript (ES6+)`, `HTML5`, `CSS3`
  * **Browser API**: `Chrome Extension API (Manifest V3)`
  * **AI**: `Google Gemini API`
  * **Key Techniques**: `Network Request Interception`, `MutationObserver`, `Service Worker Lifecycle Management`, `DOM Manipulation`, `Asynchronous JavaScript`

-----

## ⚙️ Local Setup

1.  **Clone the Repository**: `git clone https://github.com/YOUR_USERNAME/az-coding-assistant.git`
2.  **Add API Key**: Open `config.json` and replace the placeholder with your Google Gemini API key.
3.  **Load the Extension**:
      * Open Chrome and navigate to `chrome://extensions`.
      * Enable "Developer mode".
      * Click "Load unpacked" and select the project folder.