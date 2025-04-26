import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@0.10.0/dist/node/index.min.js';
const GEMINI_API_KEY = process.env.super_secret_key;


const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


async function translate() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'Hey gemini! I was wondering if you can translate this code into ' + language + 'for me: ' + input + 'I just want the code, nothing else',
    });
    console.log(response.text);
}

async function explain() {
    const input = document.querySelector("#input_area");
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'can you explain this code to me in the simplest way possible?' + input,
    });
    console.log(response.text);
}


async function main() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'Why is the sky blue?',
    });
    // console.log(response.text);
    translate();
    explain();

}

main();


