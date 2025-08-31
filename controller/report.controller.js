import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const analyzeReport = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        let extractedText = "";

        if (req.file.mimetype === "application/pdf") {
            const data = await pdfParse(req.file.buffer);
            extractedText = data.text;
        } else if (req.file.mimetype.startsWith("image/")) {
            const result = await Tesseract.recognize(req.file.buffer, "eng");
            extractedText = result.data.text;
        } else {
            extractedText = req.file.buffer.toString("utf-8");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are a professional health assistant.  
Analyze the given medical report carefully.  

✅ Your task:  
1. Summarize the report in **simple and easy-to-understand language** for a normal user.  
2. Clearly mention:  
   - Normal / Healthy findings  
   - Health issues / risks  
3. For each health issue, give **detailed suggestions**:  
   - 🧘 Yoga/Exercise recommendations  
   - 🥗 Food and diet recommendations  
   - 💆 Therapy / lifestyle changes  
   - ⏳ Approximate time to improve the condition (in weeks/months if possible)  
4. Add **all possible practical suggestions** to reduce or manage these issues.  
5. Keep the tone **friendly, supportive, and motivating** (like a doctor explaining to a patient).  
6. Structure the response with headings, bullet points, and emojis for readability.  

Input: [User’s Medical Report Data]  

Output: A clear, structured, and helpful health analysis + recommendations + short (2-3 line).

${extractedText}
`;



        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary, extractedText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};


