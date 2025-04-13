"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import modules from "@/services/Options";
import moment from "moment/moment";
import SummeryPage from "../_components/summeryBox";
function ViewSummery() {
  const { roomid } = useParams();

  const { ExpertsList } = modules;
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  console.log("show dcsromdata", DiscussionRoomData);

  const GetAbstractImages = (option) => {
    const coachingOption = ExpertsList.find((item) => item.name === option);

    return coachingOption?.abstract || "/img1.jpg";
  };

  return (
    <div className="  ">
      <div className="flex justify-between items-end">
        <div className="flex items-center ">
          <Image
            src={GetAbstractImages(DiscussionRoomData?.coachingOption)}
            alt="abstract"
            width={50}
            height={50}
            className="w-[70px] h-[70px] rounded-full"
          />
        </div>
        <div>
          <h2 className="font-bold text-lg">{DiscussionRoomData?.topic}</h2>
          <h2 className="text-gray-800">{DiscussionRoomData?.subjectOption}</h2>
        </div>

        <h2 className="text-gray-800 ">
          {moment(DiscussionRoomData?._creationTime).fromNow()}
        </h2>
      </div>
      <div>
        <div>
          <SummeryPage />
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default ViewSummery;
