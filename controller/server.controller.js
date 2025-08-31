import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { User } from "../model/user.model.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const CreateServer = async (req, res) => {
  const { prompt } = req.body;
  let userId = req.user.userId;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const finalPrompt = `
  You are a professional health assistant.
  - Always give answers in simple and clear language.
  - Provide only health-related suggestions (not entertainment or irrelevant info).
  - If user asks non-health question, politely refuse.
  User question: ${prompt}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = await response.text();

    await User.findByIdAndUpdate(userId, {
      $push: {
        history: { prompt, response: text }
      }
    });

    return res.status(201).json({ response: text });

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
};
