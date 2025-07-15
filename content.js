fetch(chrome.runtime.getURL("config.json"))
  .then((res) => res.json())
  .then((config) => {
    const AI_API_KEY = config.AI_API_KEY;
    initAIHelp(AI_API_KEY);
  })
  .catch((err) => console.error("Failed to load config.json:", err));


function initAIHelp(AI_API_KEY) {
  const targetButtonContainerSelector = ".py-4.px-3.coding_desc_container__gdB9M";
  const chatboxTargetContainerSelector = ".py-4.px-3.coding_desc_container__gdB9M";
  const botIcon = chrome.runtime.getURL("assets/bot-icon.png");
  const userIcon = chrome.runtime.getURL("assets/user-icon.png");

  function createChatbox() {
    const chatboxWrapper = document.createElement("div");
    chatboxWrapper.id = "ai-chatbox";
    chatboxWrapper.innerHTML = `
      <div class="ai-chatbox-header">
        <span>AI Assistant</span>
        <button id="ai-close-btn">✕</button>
      </div>
      <div class="ai-chatbox-messages" id="ai-messages">
        <div class="ai-message ai-message-received">
          <img src="${botIcon}" class="ai-avatar" />
          <div class="ai-bubble">Hi! How can I help you?</div>
        </div>
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

    aiHelpButton.addEventListener("click", () => {
      aiHelpButton.style.display = "none";

      const chatbox = createChatbox();
      const chatboxTargetContainer = document.querySelector(chatboxTargetContainerSelector);
      if (chatboxTargetContainer) {
        chatboxTargetContainer.insertAdjacentElement("beforeend", chatbox);
      } else {
        console.warn("Chatbox target container not found.");
        return;
      }

      document.getElementById("ai-close-btn").onclick = () => {
        chatbox.remove();
        aiHelpButton.style.display = "inline-block";
      };

      const input = document.getElementById("ai-user-input");
      const sendButton = document.getElementById("ai-send-btn");

      let isSending = false;

      function markdownToHTML(markdown) {
        return markdown
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/\n/g, '<br>');
      }

      async function sendMessage() {
        if (isSending) return;
        isSending = true;

        const msg = input.value.trim();
        if (!msg) {
          isSending = false;
          return;
        }

        sendButton.disabled = true;
        input.value = "";

        const messagesContainer = document.getElementById("ai-messages");

        // Show user message
        const userMsg = document.createElement("div");
        userMsg.className = "ai-message ai-message-sent";
        userMsg.innerHTML = `
          <div class="ai-bubble">${msg}</div>
          <img src="${userIcon}" class="ai-avatar" />
        `;
        messagesContainer.appendChild(userMsg);

        // Show AI placeholder
        const aiMsg = document.createElement("div");
        aiMsg.className = "ai-message ai-message-received";
        aiMsg.innerHTML = `
          <img src="${botIcon}" class="ai-avatar" />
          <div class="ai-bubble">Thinking...</div>
        `;
        messagesContainer.appendChild(aiMsg);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
          const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${AI_API_KEY}`
            },
            body: JSON.stringify({
              model: "google/gemma-3n-e4b-it",
              messages: [{ role: "user", content: msg }]
            })
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("Status", response.status, data);
            aiMsg.innerHTML = `
              <img src="${botIcon}" class="ai-avatar" />
              <div class="ai-bubble">${data?.error?.message || "⚠️ AI service error."}</div>
            `;
          } else {
            const reply = data?.choices?.[0]?.message?.content;
            aiMsg.innerHTML = `
              <img src="${botIcon}" class="ai-avatar" />
              <div class="ai-bubble">${markdownToHTML(reply || "⚠️ Empty response.")}</div>
            `;
          }

        } catch (error) {
          console.error("Network or parsing error:", error);
          aiMsg.innerHTML = `
            <img src="${botIcon}" class="ai-avatar" />
            <div class="ai-bubble">❌ Failed to connect to AI.</div>
          `;
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        sendButton.disabled = false;
        isSending = false;
      }

      sendButton.onclick = sendMessage;
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          sendMessage();
        }
      });
    });

    const buttonTargetContainer = document.querySelector(targetButtonContainerSelector);
    if (buttonTargetContainer) {
      buttonTargetContainer.insertAdjacentElement("beforeend", aiHelpButton);
    }
  }

  // SPA support: observe for route/DOM changes
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

}
