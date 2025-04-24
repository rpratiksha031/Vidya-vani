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
import { ChevronDown, ChevronUp } from "lucide-react";

function History() {
  const [discussionRoomList, setDiscussionRoomList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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
    setDiscussionRoomList(result);
  };

  const GetAbstractImages = (option) => {
    const coachingOption = ExpertsList.find((item) => item.name === option);
    return coachingOption?.abstract || "/img1.jpg";
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md h-auto">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleOpen}
      >
        <h2 className="font-bold text-xl">
          Your Previous Lecture notes/summery
        </h2>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "5000px" : "0",
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? "1.25rem" : "0",
          padding: isOpen ? "0" : "0",
        }}
      >
        {discussionRoomList?.length == 0 && (
          <h2 className="text-gray-500">You don't have any previous lecture</h2>
        )}

        {discussionRoomList?.map(
          (item, index) =>
            (item.subjectOption == "Attend a lecture" ||
              item.subjectOption == "Career guidance" ||
              item.subjectOption == "Meditation and mental health support") && (
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
