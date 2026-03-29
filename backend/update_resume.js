const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const fs = require('fs');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const pdfPath = 'C:\\Smart Farm Assistant\\Resume v2.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error("Could not find PDF at " + pdfPath);
    return;
  }
  
  const fileBytes = fs.readFileSync(pdfPath);
  const base64Data = fileBytes.toString('base64');
  
  const prompt = `Here is my current resume. Please carefully read it and extract all the information.
Then, add a new project entry to the "Projects" section for my latest system.

Project Details to Add:
- Title: Smart Farm Assistant
- Link: https://smart-farm-assistant.vercel.app/
- Technologies: React (Vite), Node.js, Express, MongoDB, Google Gemini AI.
- Description: Built a premium, fully localized (English/Tagalog) farm management platform with a mobile-first, glassmorphic UI. Engineered a robust backend that integrates real-time farm data with Google Gemini to power a context-aware AI chatbot assistant. Implemented secure JWT authentication and comprehensive tracking for active crops, expenses, and harvests.

Ensure the bullet points for this new project match the professional tone, formatting, and action-verb style of the rest of my resume.
Output the complete, updated resume text in rich Markdown format. Do not include any conversational filler, just the final resume document.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'application/pdf'
          }
        },
        prompt
      ]
    });
    
    fs.writeFileSync('C:\\Smart Farm Assistant\\Resume_v3.md', response.text);
    console.log("SUCCESS");
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}

run();
