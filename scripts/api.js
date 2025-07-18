const api = {
    // Determines the selected language from localStorage, with a fallback.
    getSelectedLanguage: () => {
      let language = localStorage.getItem('editor-language');
      if (language) {
        language = language.replace(/"/g, '');
        return language;
      }
      if (state.problemContext?.languages?.length > 0) {
        return state.problemContext.languages[0];
      }
      return "";
    },
  
    // Gets the user's code from localStorage using the precise key.
    getLiveUserCode: (language) => {
      const { userId, currentProblemId } = state;
      if (!userId || !currentProblemId || !language) return "// Could not find user code.";
      const key = `course_${userId}_${currentProblemId}_${language}`;
      return localStorage.getItem(key) || "// Code not found in local storage.";
    },
    
    // Handles sending the message to the AI.
    handleSendMessage: async () => {
      if (state.isSending) return;
      const input = document.getElementById("ai-user-input");
      const userMessage = input.value.trim();
  
      if (!userMessage) return;
  
      ui.setThinkingState(true);
      ui.addMessage(userMessage, 'sent');
      input.value = "";
  
      if (!state.chatHistories[state.currentProblemId]) {
        state.chatHistories[state.currentProblemId] = [];
      }
      
      state.chatHistories[state.currentProblemId].push({ role: 'user', parts: [{ text: userMessage }] });
      
      if (!state.problemContext) {
          console.error("handleSendMessage called but state.problemContext is null.");
          ui.addMessage("⚠️ **Error:** Problem context not loaded. Please refresh.", 'received');
          ui.setThinkingState(false);
          return;
      }
  
      // --- DEFINITIVE FIX: A simpler, more robust context construction ---
      const currentLanguage = api.getSelectedLanguage();
      state.userCode = api.getLiveUserCode(currentLanguage);
  
      // 1. Start with the system prompt.
      const messages = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I will act as an expert AI pair programmer and analyze the user's code and question based on the provided context." }] }
      ];
  
      // 2. Add the entire chat history.
      messages.push(...state.chatHistories[state.currentProblemId]);
  
      // 3. Add the full, up-to-date context as the VERY LAST user message.
      // This ensures the AI pays maximum attention to it.
      const finalContextPrompt = `
        ---
        HERE IS THE FULL, UP-TO-DATE CONTEXT. USE THIS TO ANSWER MY LAST QUESTION.
        
        Problem Title: ${state.problemContext.title}
        Problem Description: ${state.problemContext.body}
        Hints & Solution Approach: ${JSON.stringify(state.problemContext.hints)}
        My Current Code (${currentLanguage}):
        \`\`\`
        ${state.userCode}
        \`\`\`
        ---
        My Question: "${userMessage}"
      `;
      
      // Replace the last user message with this enriched version.
      messages[messages.length - 1] = { role: "user", parts: [{ text: finalContextPrompt }]};
      
      ui.addMessage("Thinking...", 'received');
  
      try {
        const response = await chrome.runtime.sendMessage({
          type: "FETCH_AI_COMPLETION",
          payload: { messages: messages },
        });
  
        const messagesContainer = document.getElementById("ai-messages");
        messagesContainer.lastChild.remove();
  
        if (response && response.success && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const reply = response.data.candidates[0].content.parts[0].text;
          ui.addMessage(reply, 'received');
          state.chatHistories[state.currentProblemId].push({ role: 'model', parts: [{ text: reply }] });
        } else {
          const finishReason = response.data?.candidates?.[0]?.finishReason;
          const errorMessage = response.error || `The API returned an invalid response. Finish Reason: ${finishReason || 'Unknown'}`;
          const fullErrorMessage = `⚠️ AI Error: ${errorMessage}`;
          
          console.error("Google API Response Error:", response);
          ui.addMessage(fullErrorMessage, 'received');
          state.chatHistories[state.currentProblemId].push({ role: 'model', parts: [{ text: fullErrorMessage }] });
        }
      } catch (error) {
          const messagesContainer = document.getElementById("ai-messages");
          if (messagesContainer.lastChild) messagesContainer.lastChild.remove();
          const fullErrorMessage = `❌ Network error: ${error.message}`;
          
          ui.addMessage(fullErrorMessage, 'received');
          console.error("Error communicating with background script:", error);
          state.chatHistories[state.currentProblemId].push({ role: 'model', parts: [{ text: fullErrorMessage }] });
      } finally {
          ui.setThinkingState(false);
          utils.saveChatHistories();
      }
    }
  };
  