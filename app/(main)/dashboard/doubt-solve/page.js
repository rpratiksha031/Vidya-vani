// FILE: app/(main)/dashboard/doubt-solve/page.js
"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import solveDoubt from "../../../../services/solveDoubt";

function Page() {
  const [imagePreview, setImagePreview] = useState(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Store conversation history
  const [chatHistory, setChatHistory] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text && !imagePreview) {
      setError("Please provide either text or an image");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Save current user input
    const currentUserInput = {
      type: "user",
      text: text,
      image: imagePreview,
      timestamp: new Date().toISOString(),
    };

    // Add to chat history
    setChatHistory((prev) => [...prev, currentUserInput]);

    try {
      // Call the AI service
      const response = await solveDoubt(text, imagePreview);

      if (response.error) {
        setError(response.content);
      } else {
        // Add AI response to chat history
        const aiResponse = {
          type: "ai",
          text: response.content,
          timestamp: new Date().toISOString(),
        };

        setChatHistory((prev) => [...prev, aiResponse]);
      }
    } catch (err) {
      setError("Failed to process your request. Please try again.");
      console.error(err);
    } finally {
      // Clear input fields for next message
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col   h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b py-4 px-6">
        <h1 className="md:text-2xl font-bold text-center">Doubt Solver</h1>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="md:text-lg mb-2">Welcome to Doubt Solver</p>
              <p>Ask a question or upload an image to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {message.type === "user" && message.image && (
                    <div className="mb-2">
                      <Image
                        src={message.image}
                        alt="User uploaded"
                        width={200}
                        height={150}
                        className="rounded-md object-contain max-h-48"
                      />
                    </div>
                  )}
                  <div className="text-sm">
                    {message.text.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className={`${line.trim() === "" ? "h-4" : ""}`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  <div
                    className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 text-red-700 px-4 py-2 text-center">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="2"
              ></textarea>

              {/* Image upload button */}
              <div className="absolute bottom-2 right-2">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full p-2 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!text && !imagePreview)}
              className={`shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg ${
                isLoading || (!text && !imagePreview)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Send"
              )}
            </button>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <Image
                src={imagePreview}
                alt="Preview"
                className="h-20 object-contain rounded border border-gray-200"
                width={80}
                height={80}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Page;
