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
    <div className="pb-6 mt-24 mb-24">
      <div className="">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold  text-black ">
              Your workspace to explore and interact with Vidya-Vani
            </h2>
            <h2 className="rounded-3xl px-3 font-bold  md:text-2xl text-indigo-700">
              Good to see you again!{user.displayName} Dive back into your
              workspace and discover more with Vidya-Vani
            </h2>
          </div>
          <ProfileDailog>
            <Button className="ml-2 px-5 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 shadow-2xl">
              my Profile
            </Button>
          </ProfileDailog>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-10 shadow-2xl rounded-3xl py-5 px-5">
        {ExpertsList.map((option, index) => (
          <div
            key={index}
            className=" pd-3 mt-3 bg-gray-200 rounded-3xl grid-cols-6 flex flex-col justify-between items-center gap-10 h-40 shadow-2xl "
          >
            <UserInputDailog ExpertsList={option}>
              <div
                key={index}
                className=" flex flex-col justify-center items-center shadow-2xl rounded-2xl pt-5"
              >
                <Image
                  src={option.icon}
                  alt={option.name}
                  width={150}
                  height={150}
                  className="h-[70px] w-[70px] mt-3 hover:rotate-12 cursur-pointer rounded-full "
                />

                <h2
                  className="mt-5 bg-blue-200 px-3 rounded-3xl transform hover:scale-110  duration-300 text-bold text-black font-bold  
                
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
