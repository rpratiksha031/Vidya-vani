import OpenAI from "openai";
import modules from "./Options";

const { ExpertsList, Teachers } = modules;

// Available models on OpenRouter (as of 2024/2025)
const AVAILABLE_MODELS = [
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "google/gemma-2-9b-it:free",
  "openai/gpt-3.5-turbo", // Keep as fallback, but may not be available
];

const AIModel = async (topic, coachingOption, msg) => {
  try {
    console.log("AIModel called with:", { topic, coachingOption, msg });

    // Validate inputs
    if (!topic || !coachingOption || !msg) {
      console.error("Missing required parameters");
      return { error: true, content: "Missing required information" };
    }

    // Find coaching option
    const option = ExpertsList.find((item) => item.name === coachingOption);
    if (!option) {
      console.error("Coaching option not found:", coachingOption);
      return {
        error: true,
        content: `Unknown coaching option: ${coachingOption}`,
      };
    }

    const PROMPT = option.prompt
      .replace("{user_topic}", topic)
      .replace("{expert_name}", Teachers.name);

    // Debug log API key (only first/last few characters for security)
    const apiKey = process.env.NEXT_PUBLIC_AI_OPENROUTER || "";
    console.log("API Key status:", {
      exists: !!apiKey,
      length: apiKey.length,
      prefix:
        apiKey.length > 6
          ? apiKey.slice(0, 3) + "..." + apiKey.slice(-3)
          : "too short",
    });

    // Validate API key
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Invalid or missing OpenRouter API key");
    }

    // Try multiple models in order of preference
    for (const model of AVAILABLE_MODELS) {
      try {
        console.log(`Attempting to use model: ${model}`);

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "AI Coaching App",
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: PROMPT },
                { role: "user", content: msg },
              ],
              temperature: 0.7,
              max_tokens: 500,
              // Add stream: false to ensure we get complete response
              stream: false,
            }),
          }
        );

        // Check for HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(
            `Model ${model} failed with ${response.status}: ${errorText}`
          );

          // If it's a 404 for this specific model, try the next one
          if (response.status === 404) {
            continue;
          }

          // For other errors, throw to be caught by outer try/catch
          throw new Error(`API HTTP error ${response.status}: ${errorText}`);
        }

        // Parse response
        const data = await response.json();
        console.log(`Successful response from model ${model}:`, data);

        // Check if response has the expected structure
        if (
          data.choices &&
          data.choices.length > 0 &&
          data.choices[0].message
        ) {
          return {
            error: false,
            content: data.choices[0].message.content,
            model_used: model,
          };
        } else {
          console.warn(`Unexpected response structure from ${model}:`, data);
          continue; // Try next model
        }
      } catch (modelError) {
        console.warn(`Error with model ${model}:`, modelError.message);
        // Continue to next model
        continue;
      }
    }

    // If all models failed, throw an error
    throw new Error("All available models failed or are unavailable");
  } catch (error) {
    console.error("Error in AIModel:", error);

    // Enhanced fallback for development
    if (process.env.NODE_ENV === "development") {
      console.log("Using enhanced fallback response in development mode");
      return {
        error: false,
        content: generateMockResponse(topic, coachingOption, msg),
        model_used: "development-fallback",
      };
    }

    return {
      error: true,
      content: `I'm currently experiencing technical difficulties. Please try again in a moment. Error: ${error.message}`,
    };
  }
};

// Enhanced mock response generator for development
const generateMockResponse = (topic, coachingOption, msg) => {
  const responses = [
    `Thank you for your question about "${topic}". As your ${coachingOption}, I understand you're asking: "${msg}". This is a mock response for development purposes.`,
    `That's an interesting point about ${topic}. Let me help you with that. [This is a development fallback response]`,
    `I see you're working on ${topic} with the ${coachingOption} approach. Here's my guidance: [Mock response for development]`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

// Utility function to check available models (optional)
export const checkAvailableModels = async () => {
  const apiKey = process.env.NEXT_PUBLIC_AI_OPENROUTER || "";

  if (!apiKey) {
    console.error("No API key available for model checking");
    return [];
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error("Error checking available models:", error);
  }

  return [];
};

export default AIModel;
