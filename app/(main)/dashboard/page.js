"use client";
import React from "react";
import FeatureAssistants from "./_compoents/FeatureAssistants";
import TabInterface from "./_compoents/TabInterface";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Dashboard() {
  const router = useRouter();
  const handleSignIn = () => {
    // Here you would typically have authentication logic
    // For now, we'll just redirect to the dashboard
    router.push("/dashboard/scraping");
  };
  return (
    <div className="bg-gradient-to-r from-blue-300 via-teal-200 to-emerald-300 px-5 py-5 rounded-2xl my-30 ">
      <FeatureAssistants />
      <div className=" mx-40 lg:mx-190 md:mx-90 ">
        <Button
          onClick={handleSignIn}
          className=" bg-gray-300 hover:bg-gray-500 text-black "
        >
          click here to explore more
        </Button>
      </div>
      <div className="mt-20">
        <TabInterface />
      </div>
    </div>
  );
}

export default Dashboard;
