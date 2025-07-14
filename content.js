const codingDescContainerClass = "ant-row  d-flex gap-4 mt-1 css-19gw05y";

function addAIHelpButton() {
    // Avoid duplicate buttons
    if (document.getElementById("ai-help-button")) return;

    const container = document.getElementsByClassName(codingDescContainerClass)[0];
    if (!container) return;

    const aiHelpButton = document.createElement("button");
    aiHelpButton.id = "ai-help-button";
    aiHelpButton.innerText = "AI Help";

    aiHelpButton.addEventListener("click", function () {
        alert("AI Help chatbot will open here!");
    });

    container.appendChild(aiHelpButton);
}

function observeContainerChanges() {
    const bodyObserver = new MutationObserver(() => {
        const container = document.getElementsByClassName(codingDescContainerClass)[0];

        if (container && !container.querySelector("#ai-help-button")) {
            addAIHelpButton();
        }

        // Observe the specific container for re-renders
        if (container) {
            const containerObserver = new MutationObserver(() => {
                if (!container.querySelector("#ai-help-button")) {
                    addAIHelpButton();
                }
            });

            containerObserver.observe(container, {
                childList: true,
                subtree: true,
            });
        }
    });

    bodyObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// Run once at startup
addAIHelpButton();
observeContainerChanges();
