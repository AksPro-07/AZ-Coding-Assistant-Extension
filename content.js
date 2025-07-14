const codingDescContainerClass = "py-4 px-3 coding_desc_container__gdB9M";

function addAIHelpButton() {
    const aiHelpButton = document.createElement("button");
    aiHelpButton.innerText = "AI Help";
    aiHelpButton.id = "ai-help-button";

    // Add a click event listener
    aiHelpButton.addEventListener("click", function () {
        alert("AI Help chatbot will open here!");
    });

    // Append the button to the body
    const codingDescContainer = document.getElementsByClassName(codingDescContainerClass)[0];
    codingDescContainer.insertAdjacentElement("beforeend", aiHelpButton);
}

addAIHelpButton();
