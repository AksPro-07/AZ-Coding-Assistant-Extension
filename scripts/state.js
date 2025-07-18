const state = {
    currentProblemId: null,
    problemContext: null,
    userCode: null,
    chatHistories: {}, // Stored as { [problemId]: [messages] }
    isSending: false, // Prevents multiple simultaneous messages
    userId: null, // To be fetched
    isInitializing: false, // Prevents setup race conditions
  };