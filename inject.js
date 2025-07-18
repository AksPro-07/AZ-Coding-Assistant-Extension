/**
 * This script is injected into the main page's context to intercept
 * both `fetch` and `XMLHttpRequest` to ensure data capture.
 * It is now intelligent and will only send a message for a NEW problem ID once.
 */

let lastProblemIdSent = null;
let lastUserIdSent = null;

// --- A helper function to process the captured data ---
function processData(url, responseText) {
  try {
    const data = JSON.parse(responseText);
    
    // Check for problem data
    if (url.includes('/problems/user/')) {
      const problemId = data?.data?.id;
      // --- FIX: Only send a message if this is a new problem ID ---
      if (problemId && problemId !== lastProblemIdSent) {
        lastProblemIdSent = problemId; // Mark this ID as sent
        window.postMessage({
          type: 'AZ_ASSISTANT_PROBLEM_DATA',
          payload: data.data,
        }, '*');
      }
    }

    // Check for user profile data
    if (url.includes('/users/profile/private')) {
      const userId = data?.data?.id;
       // --- FIX: Only send the user ID once ---
      if (userId && userId !== lastUserIdSent) {
        lastUserIdSent = userId; // Mark this ID as sent
        window.postMessage({
          type: 'AZ_ASSISTANT_USER_DATA',
          payload: data.data,
        }, '*');
      }
    }
  } catch (e) {
    // Ignore parsing errors for non-JSON responses
  }
}


// --- 1. Intercept `fetch` requests ---
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [url] = args;
  const response = await originalFetch(...args);

  if (response.ok && typeof url === 'string' && url.includes('api2.maang.in')) {
    const clonedResponse = response.clone();
    clonedResponse.text().then(text => processData(url, text));
  }
  return response;
};


// --- 2. Intercept `XMLHttpRequest` requests ---
const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(...args) {
  this._url = args[1];
  return originalXhrOpen.apply(this, args);
};

XMLHttpRequest.prototype.send = function(...args) {
  this.addEventListener('load', function() {
    if (this.readyState === 4 && this.status === 200 && this._url && this._url.includes('api2.maang.in')) {
      processData(this._url, this.responseText);
    }
  });
  return originalXhrSend.apply(this, args);
};
