"use client";
import React from "react";
import FeatureAssistants from "./_compoents/FeatureAssistants";
import TabInterface from "./_compoents/TabInterface";

function Dashboard() {
  return (
    <div className="bg-gradient-to-r from-blue-300 via-teal-200 to-emerald-300 px-5 py-1 rounded-2xl  shadow-2xl">
      <div className=" ">
        <FeatureAssistants />
      </div>

      <div className="mt-1">
        <TabInterface />
      </div>
    </div>
  );
}

export default Dashboard;
