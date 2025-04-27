import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
const GEMINI_API_KEY = process.env.super_secret_key;


async function ensureContentScript(tabId: number) {
    return new Promise<void>((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                files: ["dist/content.js"],
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            }
        );
    });
}


chrome.runtime.sendMessage({ popupOpened: true }, (response) => {
    console.log('Got response from background:', response);
    // do stuff with the response
});


const ai = new GoogleGenAI({ apiKey: "AIzaSyDwYwlAV2A3eyVi1x68oy3zPB2mx1U641A" });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "explainSelectedText") {
        const inputArea = document.getElementById("input_area") as HTMLTextAreaElement;
        inputArea.value = message.data; // Set the input box

        // Click the Explain button automatically
        const explainButton = document.getElementById("explain") as HTMLButtonElement;
        explainButton.click();
    }
});



async function translate() {
    const inputArea = document.getElementById("input_area") as HTMLTextAreaElement;
    const input = inputArea!.value;
    const language = document.querySelector("#languageInput") as HTMLTextAreaElement;
    const languageText = language!.value;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'Hey gemini! I was wondering if you can translate this code into ' + languageText + 'for me: ' + input + 'I just want the code, nothing else. Feel free to use markdown but no html',
    });
    return response.text ?? "";
}

async function explain() {
    const inputArea = document.getElementById("input_area") as HTMLTextAreaElement
    const input = inputArea!.value;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'can you explain this code to me in the simplest way possible?' + input + 'only use styling with markdown, implying things such as ***(text)***, however, dont use any form of list in your formatting, using paragraphing where appropritate with new lines, and do not mention any of this in your response, just the code',
    });

    return response.text ?? "";
}

async function getFeedback() {
    const codeSnippetArea = document.getElementById("code_snippet_area") as HTMLTextAreaElement
    const codeSnippet = codeSnippetArea!.value;
    const studentAnswerArea = document.getElementById("student_answer_area") as HTMLTextAreaElement
    const studentAnswer = studentAnswerArea!.value;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 
`You are an expert coding tutor. Follow these steps carefully: Rate the difficulty of the provided code snippet on a scale from 1 to 5: 1 = Very easy, 5 = Very complex.
Grade the student's explanation of the code on a scale from 1 to 5:
1 = No understanding of the code. 2–3 = Partial or unclear understanding. 4 = Good understanding of the main concepts. 5 = Clear and complete understanding of the main concepts, even if the explanation is brief. 

Important: A student's explanation can be short and still deserve a 5 if it accurately captures the main ideas and functionality of the code.` +
`Provide a short feedback comment (1–2 sentences) to the student explaining what they got right and/or what they missed (if anything).

Respond only in the following format:
Difficulty: [1-5]
Understanding Score: [1-5]
Brief Feedback: [short comment]

Here is the code snippet: ` + codeSnippet + 
'Here is the student\'s explanation: ' + studentAnswer
    });
    return response.text ?? "";
}

async function quizFeedback() {
    const geminiResponse = await getFeedback();
    const splitResponse = geminiResponse.split('\n');

    const difficulty = splitResponse[0] || '';
    const understandingScore = splitResponse[1] || '';
    const feedback = splitResponse[2] || '';

    const xpGained = await calculateXP(difficulty, understandingScore);
    // Send the XP gained to the content script
    // chrome.runtime.sendMessage({ xpGained: xpGained }, (response) => {
}

async function calculateXP(difficulty: string, understandingScore: string) {
    const cleanDifficulty = parseInt(difficulty.replace(/\D/g, ''));
    const cleanUnderstandingScore = parseInt(understandingScore.replace(/\D/g, ''));
    
    const xpGained = (cleanDifficulty + cleanUnderstandingScore) * 2 + Math.min(cleanDifficulty, cleanUnderstandingScore);
    return xpGained;
}


const explainButton = document.getElementById("explain") as HTMLButtonElement;
const translateButton = document.getElementById("translate") as HTMLButtonElement;
const outputBox = document.getElementById("output_area") as HTMLDivElement// assume it's a <textarea>
const inputBox = document.getElementById("input_area") as HTMLTextAreaElement;

explainButton.addEventListener("click", async () => {
    const response = await explain();
    outputBox.innerHTML = await marked.parse(response); // <-- raw markdown text, no marked.parse
});

translateButton.addEventListener("click", async () => {
    const response = await translate();
    outputBox.innerHTML = await marked.parse(response); //
});
// popup.ts

// Utility function to get the currently active tab
async function getActiveTab(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            if (tabs.length === 0 || !tabs[0].id) {
                reject(new Error("No active tab found."));
                return;
            }
            resolve(tabs[0]);
        });
    });
}

// Function to request selected text from the content script
async function requestSelectedText() {
    try {
        const tab = await getActiveTab();

        // 👉 FIX: Inject the content script first
        await ensureContentScript(tab.id!);

        chrome.tabs.sendMessage(
            tab.id!,
            { action: "getSelectedText" },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Message error:", chrome.runtime.lastError.message);
                    showError("Could not get selected text. Are you on a supported page?");
                    return;
                }

                if (response?.selectedText) {
                    console.log("Selected text:", response.selectedText);
                    updateOutput(response.selectedText);
                    inputBox.value = response.selectedText;
                } else {
                    showError("No text selected.");
                }
            }
        );
    } catch (error) {
        console.error("Error fetching tab or sending message:", error);
        showError("Failed to access tab.");
    }
}


// Function to update the popup UI with the selected text
function updateOutput(text: string) {
    const outputElement = document.getElementById('output');
    if (outputElement) {
        outputElement.textContent = text;
    }
}

// Function to show an error in the popup UI
function showError(message: string) {
    const outputElement = document.getElementById('output');
    if (outputElement) {
        outputElement.textContent = message;
    }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    requestSelectedText();
});


// const explainButton = document.getElementById("explain");
// const outputBox = document.getElementById("output_area");
explainButton!.addEventListener("click", async () => {
    console.log("1")
    const response = await explain();
    const output = await response as string;
    outputBox!.innerHTML = await marked.parse(output);
});

// const translateButton = document.getElementById("translate");
translateButton!.addEventListener("click", async () => {
    console.log("1")
    const response = await translate();
    const output = await response as string;
    outputBox!.innerHTML = await marked.parse(output);
})

const toggle = document.getElementById("toggle") as HTMLInputElement
toggle!.addEventListener("click", async () => {
    window.postMessage({
        source: 'my-extension',
        type: 'FROM_A',
        payload: toggle.value,
    }, '*');
})

