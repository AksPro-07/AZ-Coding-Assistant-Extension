const ui = {
    createChatbox: () => {
      const chatboxWrapper = document.createElement("div");
      chatboxWrapper.id = "ai-chatbox";
      const deleteIconUrl = chrome.runtime.getURL('assets/delete.png');
      
      chatboxWrapper.innerHTML = `
        <div class="ai-chatbox-header">
          <span>AI Assistant</span>
          <div class="ai-header-buttons">
            <button id="ai-clear-btn" title="Clear Chat History">
              <img src="${deleteIconUrl}" alt="Clear Chat" class="ai-header-icon" />
            </button>
            <button id="ai-close-btn">✕</button>
          </div>
        </div>
        <div class="ai-chatbox-messages" id="ai-messages"></div>
        <div class="ai-chatbox-input">
          <input type="text" id="ai-user-input" placeholder="Ask your question..." />
          <button id="ai-send-btn">Send</button>
        </div>
      `;
      return chatboxWrapper;
    },
  
    addMessage: (message, type) => {
      const messagesContainer = document.getElementById("ai-messages");
      if (!messagesContainer) return;
  
      const msgDiv = document.createElement("div");
      msgDiv.className = `ai-message ai-message-${type}`;
      
      const avatarSrc = type === 'sent' ? ASSETS.USER_ICON : ASSETS.BOT_ICON;
      const bubbleContent = type === 'received' ? utils.markdownToHTML(message || "") : message;
  
      msgDiv.innerHTML = `
        <img src="${avatarSrc}" class="ai-avatar" />
        <div class="ai-bubble">${bubbleContent}</div>
      `;
      
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
  
    injectAIButton: () => {
      const container = document.querySelector(SELECTORS.BUTTON_CONTAINER);
      if (!container || document.getElementById("ai-help-button")) return;
  
      const aiHelpButton = document.createElement("button");
      aiHelpButton.innerText = "AI Help";
      aiHelpButton.id = "ai-help-button";
  
      aiHelpButton.addEventListener("click", ui.showChatbox);
      container.insertAdjacentElement("beforeend", aiHelpButton);
    },
  
    showChatbox: async () => {
      if (document.getElementById("ai-chatbox")) return;
  
      const aiHelpButton = document.getElementById("ai-help-button");
      if(aiHelpButton) aiHelpButton.style.display = "none";
  
      const chatbox = ui.createChatbox();
      const target = document.querySelector(SELECTORS.CHATBOX_CONTAINER);
      target.insertAdjacentElement("beforeend", chatbox);
      
      await utils.loadChatHistories();
      ui.renderChatHistory();
  
      document.getElementById("ai-close-btn").onclick = ui.hideChatbox;
      document.getElementById("ai-send-btn").onclick = () => api.handleSendMessage();
      document.getElementById("ai-clear-btn").onclick = ui.handleClearChat;
  
      const input = document.getElementById("ai-user-input");
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          api.handleSendMessage();
        }
      });
      input.focus();
    },
  
    renderChatHistory: () => {
      const messagesContainer = document.getElementById("ai-messages");
      if (!messagesContainer) return;
      
      messagesContainer.innerHTML = '';
      const history = state.chatHistories[state.currentProblemId] || [];
  
      history.forEach(msg => {
        const messageText = msg.parts && msg.parts[0] ? msg.parts[0].text : '';
        const messageType = msg.role === 'user' ? 'sent' : 'received';
        ui.addMessage(messageText, messageType);
      });
    },
  
    handleClearChat: () => {
      const initialMessage = "Hi! How can I help you with this problem?";
      state.chatHistories[state.currentProblemId] = [{ role: 'model', parts: [{ text: initialMessage }] }];
      
      utils.saveChatHistories();
      ui.renderChatHistory();
    },
  
    hideChatbox: () => {
      const chatbox = document.getElementById("ai-chatbox");
      if (chatbox) chatbox.remove();
      
      const aiHelpButton = document.getElementById("ai-help-button");
      if (aiHelpButton) {
        aiHelpButton.style.display = "inline-block";
      }
    },
  
    setThinkingState: (isThinking) => {
      const sendButton = document.getElementById("ai-send-btn");
      const input = document.getElementById("ai-user-input");
      if (!sendButton || !input) return;
  
      if (isThinking) {
        state.isSending = true;
        sendButton.disabled = true;
        input.disabled = true;
        sendButton.innerText = "...";
      } else {
        state.isSending = false;
        sendButton.disabled = false;
        input.disabled = false;
        sendButton.innerText = "Send";
        input.focus();
      }
    }
  };
  