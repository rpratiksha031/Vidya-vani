"use client";
import React from "react";
import { useUser } from "@stackframe/stack";
import { Button } from "../../../../components/ui/button";
import UserInputDailog from "./UserInputDailog";

import Image from "next/image";

import modules from "../../../../services/Options.jsx";
import ProfileDailog from "./ProfileDailog";

const { ExpertsList } = modules;

function FeatureAssistants() {
  const user = useUser();
  // console.log(ExpertsList);
  return (
    <div className=" mt-20 mb-20 ">
      <div className="">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold  text-black ">
              Your workspace to explore and interact with Vidya-Vani
            </h2>
          </div>
          <ProfileDailog>
            <Button className="rounded-full bg-blue-600 text-white flex items-center justify-center  text-sm font-bold h-16 w-16 lg:h-20 lg:w-20 shadow-lg hover:shadow-blue-500 transition-all duration-300 ease-in-out">
              My Profile
            </Button>
          </ProfileDailog>
        </div>
      </div>
      <div className=" shadow-2xl rounded-3xl  grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-10 mt-10 ">
        {ExpertsList.map((option, index) => (
          <div
            key={index}
            className="  mt-3 bg-[url('/study2.avif')] rounded-3xl  flex flex-col justify-between items-center  shadow-xl  bg-no-repeat bg-cover "
          >
            <UserInputDailog ExpertsList={option}>
              <div
                key={index}
                id={option.name}
                className=" flex flex-col justify-center bg-amber-100 items-center shadow-2xl rounded-2xl mt-6 lg:mt-5 lg:mb-0 mb-5  mx-5 p-5 hover:scale-105 duration-300 text-sm"
              >
                <Image
                  src={option.icon}
                  alt={option.name}
                  width={150}
                  height={150}
                  className=" h-[20px] w-[20px] lg:h-[80px] lg:w-[80px] mt-3 hover:rotate-12 cursur-pointer rounded-full "
                />

                <h2
                  className="mt-5 bg-blue-200 rounded-2xl transform hover:scale-110  duration-300  text-black m-2 p-2 text-center  cursor-pointer 
                
                font-bold  shadow-lg hover:shadow-cyan-600 transition-shadow 
                tracking-wide uppercase border-blue-600  
                "
                >
                  {option.name}
                </h2>
              </div>
            </UserInputDailog>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureAssistants;
