import OpenAI from "openai";
import modules from "./Options";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

const { ExpertsList, Teachers } = modules;

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

    // const PROMPT = option.prompt.replace("{user_topic}", topic);

    const PROMPT = option.prompt
      .replace("{user_topic}", topic)
      .replace("{expert_name}", Teachers.name);

    // Debug log API key (only first/last few characters for security)
    const apiKey = process.env.NEXT_PUBLIC_AI_OPENROUTER || "";
    console.log("API Key status:", {
      exists: !!apiKey,
      length: apiKey.length,
      prefix: apiKey.slice(0, 3) + "..." + apiKey.slice(-3),
    });

    // Try direct fetch instead of the OpenAI client
    try {
      console.log("Sending request to OpenRouter API");
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin, // Required by some APIs
            "X-Title": "AI Coaching App", // Optional identifying info
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo", // Fallback to a more reliable model
            messages: [
              { role: "system", content: PROMPT },
              { role: "user", content: msg },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API HTTP error ${response.status}: ${errorText}`);
      }

      // Parse response
      const data = await response.json();
      console.log("OpenRouter API response:", data);

      // Check if response has the expected structure
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return {
          error: false,
          content: data.choices[0].message.content,
        };
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (fetchError) {
      console.error("Fetch API error:", fetchError);

      // If API call fails, use a fallback mock response for development
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback response in development mode");
        return {
          error: false,
          content: `[Development fallback] This is a mock response for: "${msg}". In a coaching session about ${topic} with option ${coachingOption}.`,
        };
      }

      throw fetchError; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    console.error("Error in AIModel:", error);
    return {
      error: true,
      content: `I encountered a technical issue: ${error.message}. Please try again later.`,
    };
  }
};

export default AIModel;
