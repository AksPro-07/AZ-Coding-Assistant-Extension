function initializeAssistant() {
    const problemId = state.currentProblemId;
    
    const language = api.getSelectedLanguage();
    state.userCode = api.getLiveUserCode(language);
    
    ui.injectAIButton();
  }
  
  function injectScript(filePath) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    script.onload = function() { this.remove(); };
    (document.head || document.documentElement).appendChild(script);
  }
  
  // --- Main Execution ---
  
  injectScript('inject.js');
  utils.loadChatHistories();
  
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
  
    const { type, payload } = event.data;
  
    if (type === 'AZ_ASSISTANT_USER_DATA') {
      state.userId = payload.id;
    }
  
    if (type === 'AZ_ASSISTANT_PROBLEM_DATA') {
      const newProblemId = payload.id;
  
      if (newProblemId === state.currentProblemId) {
        return; 
      }
      
      state.currentProblemId = newProblemId;
      state.problemContext = payload;
      
      // Create and save the initial greeting message for the new problem
      if (!state.chatHistories[newProblemId]) {
        const initialMessage = "Hi! How can I help you with this problem?";
        state.chatHistories[newProblemId] = [{ role: 'model', parts: [{ text: initialMessage }] }];
        utils.saveChatHistories(); // Persist it immediately
      }
      
      const oldChatbox = document.getElementById("ai-chatbox");
      if (oldChatbox) oldChatbox.remove();
      const oldButton = document.getElementById("ai-help-button");
      if (oldButton) oldButton.remove();
  
      initializeAssistant();
    }
  });
  
  // Real-time listener for code changes
  window.addEventListener('storage', (event) => {
    const { key, newValue } = event;
    if (!key || !newValue) return;
  
    const currentLanguage = api.getSelectedLanguage();
    const expectedKey = `course_${state.userId}_${state.currentProblemId}_${currentLanguage}`;
  
    if (key === expectedKey) {
      state.userCode = newValue;
    }
  });
  
  // Persistent observer to handle SPA re-renders
  window.addEventListener('DOMContentLoaded', (event) => {
    const observer = new MutationObserver((mutations) => {
      if (state.problemContext) {
        const targetContainer = document.querySelector(SELECTORS.BUTTON_CONTAINER);
        const buttonExists = document.getElementById("ai-help-button");
        const chatboxExists = document.getElementById("ai-chatbox");
  
        if (targetContainer && !buttonExists && !chatboxExists) {
          ui.injectAIButton();
        }
      }
    });
  
    // Now it's safe to observe the body because we know it exists.
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
  