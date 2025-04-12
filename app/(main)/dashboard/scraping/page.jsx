// pages/scrape.tsx
"use client";
import { useState } from "react";

export default function ScrapePage() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setContent(data.content || "No content found.");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🕸️ Web Scraper</h1>
      <input
        className="w-full p-2 border rounded mb-2"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a URL (e.g. https://example.com)"
      />
      <button
        onClick={handleScrape}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Scraping..." : "Scrape"}
      </button>
      <div className="mt-4 whitespace-pre-wrap bg-gray-100 p-3 rounded">
        {content}
      </div>
    </div>
  );
}
