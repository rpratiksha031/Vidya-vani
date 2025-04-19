"use client";
import { useState } from "react";
import { BookOpen, Link, RefreshCw, AlertCircle } from "lucide-react";

export default function ScrapingPage() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      // Using fetch directly with try/catch for better error handling
      const response = await fetch("api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      // Check if response is JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "API response is not JSON. The server might be returning an HTML error page."
        );
      }

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to process the URL");
      } else {
        setSummary(result.summary);
        setTitle(result.title || "Article Summary");
      }
    } catch (err) {
      console.error("Error during fetch:", err);
      setError(
        `Request failed: ${err.message}. Make sure your API endpoint is set up correctly.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // For demonstration/testing, allow direct summarization with a mock API
  const handleTestSummarize = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      // Mock response for testing without API dependency
      // In a real app, you'd use the API endpoint
      setTimeout(() => {
        setTitle("Mock Summary of " + url);
        setSummary(
          "This is a mock summary for testing purposes.\n\nThe actual implementation would call your API endpoint and process real web content.\n\nMake sure your API route is properly set up at '/api/scrape' or adjust the fetch URL in the code to match your API endpoint location."
        );
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Failed to create mock summary");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              Web Content Summarizer
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                Website URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-3"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={isLoading}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </button>
              </div>
              <div className="mt-2 flex justify-between">
                <p className="text-sm text-gray-500">
                  Enter the full URL of the article or web page
                </p>
                <button
                  type="button"
                  onClick={handleTestSummarize}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Test UI (Mock)
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {summary && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  {title}
                </h2>
                <div className="max-w-none">
                  {summary.split("\n").map((paragraph, index) =>
                    paragraph ? (
                      <p key={index} className="mb-4 text-gray-700">
                        {paragraph}
                      </p>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
