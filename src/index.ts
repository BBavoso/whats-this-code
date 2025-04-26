import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
const GEMINI_API_KEY = process.env.super_secret_key;


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
        contents: 'Hey gemini! I was wondering if you can translate this code into ' + languageText + 'for me: ' + input + 'I just want the code, nothing else',
    });
    return response.text;
}

async function explain() {
    const inputArea = document.getElementById("input_area") as HTMLTextAreaElement
    const input = inputArea!.value;
    alert(input);
    console.log("a")
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'can you explain this code to me in the simplest way possible?' + input,
    });
    console.log(response)
    return response.text;
}


const explainButton = document.getElementById("explain");
const outputBox = document.getElementById("output_area");
explainButton!.addEventListener("click", async () => {
    console.log("1")
    const response = await explain();
    const output = await response as string;
    outputBox!.innerHTML = await marked.parse(output);
});

const translateButton = document.getElementById("translate");
translateButton!.addEventListener("click", async () => {
    console.log("1")
    const response = await translate();
    const output = await response as string;
    outputBox!.innerHTML = await marked.parse(output);
})
