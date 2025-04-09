import React from "react";
import FeatureAssistants from "./_compoents/FeatureAssistants";
import History from "./_compoents/History";
import Feedback from "./_compoents/Feedback";
function Dashboard() {
  return (
    <div className="bg-gradient-to-r from-blue-300 via-teal-200 to-emerald-300 px-5 py-5 rounded-2xl my-30">
      <FeatureAssistants />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
        <History />
        <Feedback />
      </div>
    </div>
  );
}

export default Dashboard;
