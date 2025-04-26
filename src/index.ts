import { GoogleGenAI } from '@google/genai';
const GEMINI_API_KEY = process.env.super_secret_key;


const ai = new GoogleGenAI({ apiKey: "AIzaSyDwYwlAV2A3eyVi1x68oy3zPB2mx1U641A" });


async function translate() {
    const input = document.querySelector("#input_area");
    const language = document.querySelector("#language_selector"); //doesn't exist yet shhhh
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
    window.alert("HI");
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


