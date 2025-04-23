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
    router.push("/dashboard/doubt-solve");
  };
  return (
    <div className=" pr-3  flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-blue-950  text-white text-center  animate-fadeIn  sticky  top-0 z-50  bg-opacity-80 backdrop-blur shadow-md gap-1 lg:gap-3">
      <Image
        className="w-20 h-20 lg:w-25 lg:h-25 rounded-full  bg-gray-200  "
        src={"/logo.svg"}
        alt="logo"
        width={150}
        height={150}
        priority
      />
      <h2 className="lg:rounded-3xl text-white lg:font-bold  md:text-xl lg:text-2xl  font-thi md:font-medium">
        Good to see you!{user.displayName} Dive into your workspace and discover
        more with Vidya-Vani
      </h2>
      <Button
        onClick={handleSignIn}
        className=" underline  md:font-bold  text-white bg-pink-40 hover:bg-pink-500 hover:shadow-lg transition-all duration-300 ease-in-out  lg:font-bold lg:text-xl lg:px-6 lg:py-2 md:text-sm md:px-4 md:py-2"
        variant="secondary"
      >
        solveDoubts
      </Button>
      <UserButton variant="secondary" />
    </div>
  );
}

export default AppHeader;
