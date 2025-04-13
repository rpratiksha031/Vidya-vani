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
    <div className=" mt-24 mb-24 ">
      <div className="">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold  text-black ">
              Your workspace to explore and interact with Vidya-Vani
            </h2>
          </div>
          <ProfileDailog>
            <Button className="ml-2 px-5 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 shadow-2xl mb-10 font-bold text-xl">
              my Profile
            </Button>
          </ProfileDailog>
        </div>
      </div>
      <div className=" shadow-2xl rounded-3xl py-5 px-5 ">
        {ExpertsList.map((option, index) => (
          <div
            key={index}
            className="  mt-3 bg-[url('/study2.avif')] rounded-3xl  flex flex-col justify-between items-center  shadow-xl py-10 lg:py-20 lg:mb-20 mb-10 bg-no-repeat bg-cover"
          >
            <UserInputDailog ExpertsList={option}>
              <div
                key={index}
                id={option.name}
                className=" flex flex-col justify-center bg-amber-100 items-center shadow-2xl rounded-2xl p-10 lg:p-20"
              >
                <Image
                  src={option.icon}
                  alt={option.name}
                  width={150}
                  height={150}
                  className=" h-[80px] w-[80px] lg:h-[200px] lg:w-[200px] mt-3 hover:rotate-12 cursur-pointer rounded-full "
                />

                <h2
                  className="mt-5 bg-blue-200 p-6 rounded-3xl transform hover:scale-110  duration-300 text-bold text-black font-bold  
                
                t  shadow-lg hover:shadow-cyan-600 transition-shadow 
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
