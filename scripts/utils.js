const utils = {
    // Extracts the problem ID (e.g., 1183) from the URL.
    getProblemIdFromUrl: () => {
      const match = window.location.href.match(/-(\d+)\?resourceUrl/);
      return match ? match[1] : null;
    },
    
    // A simple but effective markdown to HTML converter.
    markdownToHTML: (markdown) => {
      return markdown
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    },
  
    // Loads all chat histories and migrates them to the new format if necessary.
    loadChatHistories: async () => {
      const result = await chrome.storage.local.get([STORAGE_KEYS.CHAT_HISTORY]);
      const histories = result[STORAGE_KEYS.CHAT_HISTORY] || {};
  
      // --- Data Migration Step ---
      // Iterate over each problem's chat history
      for (const problemId in histories) {
        histories[problemId] = histories[problemId].map(msg => {
          // If the message is in the old format { role, content }, convert it.
          if (msg.content && !msg.parts) {
            // The Gemini API uses 'user' and 'model' for roles.
            const newRole = msg.role === 'assistant' ? 'model' : 'user';
            return { role: newRole, parts: [{ text: msg.content }] };
          }
          // If the message is already in the new format, just ensure the role is correct.
          if (msg.role === 'assistant') {
              msg.role = 'model';
          }
          return msg;
        });
      }
  
      state.chatHistories = histories;
      // Save the migrated histories back to storage immediately to prevent re-migrating.
      utils.saveChatHistories();
    },
  
    // Saves the current state of chat histories to chrome.storage.
    saveChatHistories: () => {
      chrome.storage.local.set({ [STORAGE_KEYS.CHAT_HISTORY]: state.chatHistories });
    }
  };