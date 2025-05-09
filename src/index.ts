import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
const GEMINI_API_KEY = process.env.super_secret_key;

async function ensureContentScript(tabId: number) {
  return new Promise<void>((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ['dist/content.js'],
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

let userID: string | undefined; // Declare userID as undefined initially

document.addEventListener('DOMContentLoaded', async () => {
  // Check if we already have a userID stored
  const { storedUserID } = await chrome.storage.local.get(["storedUserID"]);

  if (storedUserID) {
    userID = storedUserID;
    console.log("Loaded existing userID:", userID);
  } else {
    // Generate a new random ID
    userID = crypto.randomUUID();
    await chrome.storage.local.set({ storedUserID: userID });
    console.log("Generated new userID:", userID);
  }

  // Now that userID is assigned, update the display element
  const userIDDisplay = document.getElementById("userIDDisplay");
  if (userIDDisplay) {
    userIDDisplay.innerText = `User ID: ${userID}`;
  }

  // (You can now continue initializing your UI...)
});

const userIDDisplay = document.getElementById("userIDDisplay");
if (userIDDisplay) {
  userIDDisplay.innerText = `User ID: ${userID}`;
}

const ai = new GoogleGenAI({ apiKey: 'AIzaSyDwYwlAV2A3eyVi1x68oy3zPB2mx1U641A' });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'explainSelectedText') {
    const inputArea = document.getElementById('input_area') as HTMLTextAreaElement;
    inputArea.value = message.data; // Set the input box

    // Click the Explain button automatically
    const explainButton = document.getElementById('explain') as HTMLButtonElement;
    explainButton.click();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'translateSelectedText') {
    const inputArea = document.getElementById('input_area') as HTMLTextAreaElement;
    inputArea.value = message.data; // Set the input box
  }
});

async function translate() {
  const inputArea = document.getElementById("input_area") as HTMLTextAreaElement;
  const input = inputArea.value;
  const language = document.querySelector("#languageInput") as HTMLTextAreaElement;
  const languageText = language.value;

  // Use userID instead of username
  await fetch('http://localhost:8080/add-question', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userID,
      question: `Translate to ${languageText}: ${input}`,
    }),
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents:
      'Hey gemini! I was wondering if you can translate this code into ' +
      languageText +
      'for me: ' +
      input +
      'I just want the code, nothing else. Feel free to use markdown but no html',
  });
  return response.text ?? "";
}


async function explain() {
  const inputArea = document.getElementById("input_area") as HTMLTextAreaElement;
  const input = inputArea.value;

  // Use userID instead of username
  await fetch('http://localhost:8080/add-question', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userID,
      question: `Explain this: ${input}`,
    }),
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents:
      'can you explain this code to me in the simplest way possible?' +
      input +
      'only use styling with markdown, implying things such as ***(text)***, however, dont use any form of list in your formatting, using paragraphing where appropritate with new lines, and do not mention any of this in your response, just the code',
  });

  return response.text ?? "";
};

const explainButton = document.getElementById('explain') as HTMLButtonElement;
const translateButton = document.getElementById('translate') as HTMLButtonElement;
const outputBox = document.getElementById('output_area') as HTMLDivElement; // assume it's a <textarea>
const inputBox = document.getElementById('input_area') as HTMLTextAreaElement;

explainButton.addEventListener("click", async () => {
  const response = await explain();
  outputBox.innerHTML = await marked.parse(response); // <-- raw markdown text, no marked.parse
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
        reject(new Error('No active tab found.'));
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

    chrome.tabs.sendMessage(tab.id!, { action: 'getSelectedText' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Message error:', chrome.runtime.lastError.message);
        showError('Could not get selected text. Are you on a supported page?');
        return;
      }

      if (response?.selectedText) {
        console.log('Selected text:', response.selectedText);
        updateOutput(response.selectedText);
        inputBox.value = response.selectedText;
      } else {
        showError('No text selected.');
      }
    });
  } catch (error) {
    console.error('Error fetching tab or sending message:', error);
    showError('Failed to access tab.');
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
explainButton!.addEventListener('click', async () => {
  console.log('1');
  const response = await explain();
  const output = (await response) as string;
  outputBox!.innerHTML = await marked.parse(output);
});

// const translateButton = document.getElementById("translate");
translateButton!.addEventListener('click', async () => {
  console.log('1');
  const response = await translate();
  const output = (await response) as string;
  outputBox!.innerHTML = await marked.parse(output);
});

document.addEventListener('DOMContentLoaded', () => {
  let toggle = document.getElementById('toggleT') as HTMLInputElement | null;

  if (!toggle) {
    console.error('Toggle element not found!');
    return;
  }

  chrome.storage.local.get(['highlightEnabled']).then((result) => {
    if (result['highlightEnabled']) {
      toggle!.checked = true;
    } else {
      toggle!.checked = false;
    }
  });

  toggle.addEventListener('click', () => {
    toggle = document.getElementById('toggleT') as HTMLInputElement | null;
    chrome.storage.local.get(['highlightEnabled']).then((result) => {
      if (result['highlightEnabled']) {
        chrome.storage.local.set({ highlightEnabled: false }, () => { });
      } else {
        chrome.storage.local.set({ highlightEnabled: true }, () => { });
      }
    });
  });
});
