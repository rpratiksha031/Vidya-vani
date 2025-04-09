"use client";
import { UserContext } from "@/app/_context/UserContext";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import modules from "@/services/Options";
import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";
function History() {
  const [discussionRoomList, setDiscussionRoomList] = useState([]);
  const convex = useConvex();
  const { userData } = useContext(UserContext);

  const { ExpertsList } = modules;

  useEffect(() => {
    userData && GeDiscussionRooms();
  }, [userData]);
  const GeDiscussionRooms = async () => {
    const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
      uid: userData?._id,
    });
    // console.log("Get all dis room result", result);
    setDiscussionRoomList(result);
    // console.log("uid", userData._id);
  };

  const GetAbstractImages = (option) => {
    const coachingOption = ExpertsList.find((item) => item.name === option);
    return coachingOption?.abstract || "/img1.jpg";
  };
  return (
    <div>
      <h2 className="font-bold text-xl">Your Previous lecture</h2>
      {discussionRoomList?.length == 0 && (
        <h2 className="text-back"> You don't have any privious lecture</h2>
      )}
      <div className="mt-5">
        {discussionRoomList?.map(
          (item, index) =>
            (item.subjectOption == "Lecture on any topic" ||
              item.subjectOption == "Enhance Languages skill" ||
              item.subjectOption == "meditation") && (
              <div
                key={index}
                className="border-b-[2px] pb-4 mb-4 group flex justify-between items-center cursor-pointer"
              >
                <div className="flex gap-7">
                  <Image
                    className="rounded-full w-15 h-15"
                    src={GetAbstractImages(item.subjectOption)}
                    alt="abstract"
                    width={50}
                    height={50}
                  />

                  <div>
                    <h2 className="font-bold">{item?.topic}</h2>
                    <h2 className="text-gray-500">{item?.subjectOption}</h2>
                    <h2 className="text-gray-500 text-sm">
                      {moment(item._creationTime).fromNow()}
                    </h2>
                  </div>
                </div>
                <Link href={"/view-summery/" + item._id}>
                  <Button
                    variant="outline"
                    className="invisible group-hover:visible"
                  >
                    View Notes
                  </Button>
                </Link>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default History;
