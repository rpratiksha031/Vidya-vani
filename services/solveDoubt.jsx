// FILE: services/solveDoubt.jsx
import OpenAI from "openai";
// Add Tesseract.js for OCR
import Tesseract from "tesseract.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

// Function to extract text from images
const extractTextFromImage = async (imageBase64) => {
  try {
    // Remove data URL prefix if present
    const imageData = imageBase64.includes("base64,")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // Use Tesseract.js to extract text
    const result = await Tesseract.recognize(
      imageData,
      "eng", // English language
      {
        logger: (m) => console.log(m),
      }
    );

    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error("OCR error:", error);
    return {
      success: false,
      text: "",
      error: error.message,
    };
  }
};

const solveDoubt = async (text, imageBase64) => {
  try {
    console.log("solveDoubt called with:", {
      textProvided: !!text,
      imageProvided: !!imageBase64,
    });

    // Validate input
    if (!text && !imageBase64) {
      return {
        error: true,
        content: "Text or image is required.",
      };
    }

    let userContent = text || "";

    // If image is provided, extract text from it
    if (imageBase64) {
      const extractionResult = await extractTextFromImage(imageBase64);

      if (extractionResult.success && extractionResult.text.trim()) {
        userContent += `\n\nText extracted from image:\n${extractionResult.text}\n\n`;
      } else {
        userContent +=
          "\n\nNote: An image was provided but text extraction failed or found no text.";
      }
    }

    const PROMPT =
      "Please analyze the following doubt and provide educational feedback. If it's a question, solve it. If text was extracted from an image, assume it's part of the question or problem to solve:";

    // Create message for AI
    const messages = [
      {
        role: "user",
        content: `${PROMPT}\n\n${userContent}`,
      },
    ];

    // Call the OpenAI API through OpenRouter
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    if (!response.choices || response.choices.length === 0) {
      return {
        error: true,
        content:
          "The AI service returned an empty response. Please try again later.",
      };
    }

    return {
      error: false,
      content: response.choices[0].message.content,
    };
  } catch (error) {
    console.error("Error in solveDoubt:", error);
    return {
      error: true,
      content: `An error occurred: ${error.message}`,
    };
  }
};

export default solveDoubt;
