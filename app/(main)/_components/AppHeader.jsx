import React from "react";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";
function AppHeader() {
  return (
    <div className=" pr-3  flex justify-between items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-blue-950 p-6 text-white text-center  animate-fadeIn">
      <Image
        className="w-50 h-45 rounded-full  bg-gray-200  "
        src={"/logo.svg"}
        alt="logo"
        width={250}
        height={200}
        priority
      />
      <UserButton />
    </div>
  );
}

export default AppHeader;
