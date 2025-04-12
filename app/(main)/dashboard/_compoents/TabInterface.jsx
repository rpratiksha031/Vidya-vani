"use client";
import React, { useState } from "react";
import History from "./History";
import Feedback from "./Feedback";

function TabInterface() {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <div className="w-full">
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 text-lg font-medium ${
            activeTab === "history"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={`px-6 py-3 text-lg font-medium ${
            activeTab === "feedback"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback
        </button>
      </div>

      <div className="transition-all duration-300">
        {activeTab === "history" ? <History /> : <Feedback />}
      </div>
    </div>
  );
}

export default TabInterface;
