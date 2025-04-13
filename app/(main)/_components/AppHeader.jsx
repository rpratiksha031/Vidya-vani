"use client";
import React from "react";
import Image from "next/image";
import { UserButton, useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
function AppHeader() {
  const router = useRouter();
  const user = useUser();
  const handleSignIn = () => {
    // Here you would typically have authentication logic
    // For now, we'll just redirect to the dashboard
    router.push("/dashboard/scraping");
  };
  return (
    <div className=" pr-3  flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-blue-950  text-white text-center  animate-fadeIn  sticky  top-0 z-50  bg-opacity-80 backdrop-blur shadow-md gap-1 lg:gap-3">
      <Image
        className="w-20 h-20 lg:w-50 lg:h-45 rounded-full  bg-gray-200  "
        src={"/logo.svg"}
        alt="logo"
        width={250}
        height={200}
        priority
      />
      <h2 className="lg:rounded-3xl text-white lg:font-bold  md:text-xl lg:text-2xl  font-thi md:font-medium">
        Good to see you!{user.displayName} Dive into your workspace and discover
        more with Vidya-Vani
      </h2>
      <Button
        onClick={handleSignIn}
        className=" bg-purple-400  md:font-bold rounded-3xl text-white"
      >
        find more tools
      </Button>
      <UserButton />
    </div>
  );
}

export default AppHeader;
