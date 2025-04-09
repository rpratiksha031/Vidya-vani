import OpenAI from "openai";
import modules from "./Options";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

const { ExpertsList } = modules;

const AIModelFeedback = async (coachingOption, conversation) => {
  try {
    console.log("AIModelFeedback called with:", {
      coachingOption,
      conversationLength: Array.isArray(conversation)
        ? conversation.length
        : "not an array",
    });

    // Validate input
    if (!coachingOption) {
      return {
        error: true,
        content: "Coaching option is required.",
      };
    }

    // Ensure conversation is an array
    if (!Array.isArray(conversation)) {
      console.error("Conversation is not an array:", conversation);
      conversation = []; // Use empty array as fallback
    }

    // Find coaching option
    const option = ExpertsList.find((item) => item.name === coachingOption);

    if (!option) {
      console.error("Coaching option not found:", coachingOption);
      return {
        error: true,
        content: `Coaching option "${coachingOption}" not found.`,
      };
    }

    const PROMPT =
      option.summeryPrompt ||
      "Please analyze the following conversation and provide educational feedback.";

    // Debug log API key (only first/last few characters for security)
    const apiKey = process.env.NEXT_PUBLIC_AI_OPENROUTER || "";
    console.log("API Key status:", {
      exists: !!apiKey,
      length: apiKey.length,
      prefix: apiKey.slice(0, 3) + "..." + apiKey.slice(-3),
    });

    // Format conversation for the API
    const formattedConversation = JSON.stringify(conversation);

    try {
      console.log("Sending request to OpenRouter API");
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer":
              typeof window !== "undefined" ? window.location.origin : "", // Handle SSR case
            "X-Title": "AI Coaching App", // Optional identifying info
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo", // Fallback to a more reliable model
            messages: [
              { role: "system", content: PROMPT },
              {
                role: "user",
                content: `Please provide feedback or notes based on this conversation: ${formattedConversation}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000, // Increased token limit for more detailed feedback
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
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          error: false,
          content: data.choices[0].message.content,
        };
      } else {
        console.error("Unexpected API response structure:", data);
        throw new Error("Unexpected API response structure");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);

      // If API call fails, use a fallback mock response for development
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback response in development mode");
        return {
          error: false,
          content: `[Development fallback] Here's a summary of your ${coachingOption} session: The conversation covered key points about the topic with some good insights. Areas to improve include: deeper exploration of concepts, more specific examples, and clearer articulation of ideas. Strengths included: engaging with the material thoughtfully and asking good follow-up questions.`,
        };
      }

      throw fetchError; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    console.error("Error in AIModelFeedback:", error);
    return {
      error: true,
      content: `I encountered a technical issue: ${error.message}. Please try again later.`,
    };
  }
};

export default AIModelFeedback;
