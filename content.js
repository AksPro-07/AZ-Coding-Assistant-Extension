const targetButtonContainerSelector = ".py-4.px-3.coding_desc_container__gdB9M";
const chatboxTargetContainerSelector = ".py-4.px-3.coding_desc_container__gdB9M";

function createChatbox() {
  const chatboxWrapper = document.createElement("div");
  chatboxWrapper.id = "ai-chatbox";
  chatboxWrapper.innerHTML = `
    <div class="ai-chatbox-header">
      <span>AI Assistant</span>
      <button id="ai-close-btn">✕</button>
    </div>
    <div class="ai-chatbox-messages" id="ai-messages">
      <div class="ai-message ai-message-received">Hi! How can I help you?</div>
    </div>
    <div class="ai-chatbox-input">
      <input type="text" id="ai-user-input" placeholder="Ask your question..." />
      <button id="ai-send-btn">Send</button>
    </div>
  `;
  return chatboxWrapper;
}

function addAIHelpButton() {
  if (document.getElementById("ai-help-button")) return;

  const aiHelpButton = document.createElement("button");
  aiHelpButton.innerText = "AI Help";
  aiHelpButton.id = "ai-help-button";

  aiHelpButton.addEventListener("click", function () {
    // Hide the button
    aiHelpButton.style.display = "none";

    const chatbox = createChatbox();
    const chatboxTargetContainer = document.querySelector(chatboxTargetContainerSelector);

    if (chatboxTargetContainer) {
      chatboxTargetContainer.insertAdjacentElement("beforeend", chatbox);
    } else {
      console.warn("Chatbox target container not found.");
    }

    document.getElementById("ai-close-btn").onclick = () => {
      chatbox.remove();
      aiHelpButton.style.display = "inline-block"; // Show button again
    };

    const input = document.getElementById("ai-user-input");
    const sendButton = document.getElementById("ai-send-btn");
    
    function sendMessage() {
      const msg = input.value.trim();
      if (!msg) return;
    
      const userMsg = document.createElement("div");
      userMsg.className = "ai-message ai-message-sent";
      userMsg.textContent = msg;
    
      const messagesContainer = document.getElementById("ai-messages");
      messagesContainer.appendChild(userMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
      input.value = "";
    
      // TODO: Hook for backend API
    }
    
    sendButton.onclick = sendMessage;
    
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission or newline
        sendMessage();
      }
    });
  });

  const buttonTargetContainer = document.querySelector(targetButtonContainerSelector);
  if (buttonTargetContainer) {
    buttonTargetContainer.insertAdjacentElement("beforeend", aiHelpButton);
  }
}

// Observe route/DOM changes
const observer = new MutationObserver(() => {
  const buttonTargetContainer = document.querySelector(targetButtonContainerSelector);
  if (buttonTargetContainer && !document.getElementById("ai-help-button")) {
    addAIHelpButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial insertion
addAIHelpButton();
