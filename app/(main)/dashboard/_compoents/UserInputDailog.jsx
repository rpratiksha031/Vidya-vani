"use client";
import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../@/components/ui/dialog";
import { Textarea } from "../../../../@/components/ui/textarea";
import modules from "../../../../services/Options";

import Image from "next/image";
import { Button } from "../../../../components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/_context/UserContext";
function UserInputDailog({ children, ExpertsList }) {
  const { Teachers } = modules;

  const [selectTeacher, setSelectTeacher] = useState();

  const [topic, setTopic] = useState();

  const [loading, setLoading] = useState(false);

  const [openDailog, setOpenDailog] = useState(false);
  const router = useRouter();

  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
  const { userData } = useContext(UserContext);

  const OnClickNext = async () => {
    setLoading(true);
    const result = await createDiscussionRoom({
      topic: topic,
      subjectOption: ExpertsList?.name, //coachingOptin
      expertName: selectTeacher,
      uid: userData?._id,
    });
    // console.log(result);
    setLoading(false);
    setOpenDailog(false);
    router.push("/Disscussion-room/" + result);
  };

  return (
    <div>
      <Dialog open={openDailog} onOpenChange={setOpenDailog}>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle> {ExpertsList.name} </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-3">
                <h2 className=" text-black font-medium">
                  Type here you want to disccuss about {ExpertsList.name}{" "}
                </h2>
                <Textarea
                  placeholder="Enter your topic here ..."
                  className="mt-2"
                  onChange={(e) => setTopic(e.target.value)}
                />

                <h2 className=" text-black font-medium">
                  Select you favurite Assistant for {ExpertsList.name}{" "}
                </h2>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-6 mt-3">
                  {Teachers.map((teacher, index) => {
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectTeacher(teacher.name)}
                      >
                        <Image
                          src={teacher.avatar}
                          alt=""
                          width={100}
                          height={100}
                          className={`w-[80px] h-[80px] object-cover rounded-3xl hover:scale-105 transition-all border-green-600 cursor-pointer pd-5 ${selectTeacher === teacher.name && "border-5"}`}
                        />
                        <h2 className="text-center">{teacher.name}</h2>
                      </div>
                    );
                  })}
                </div>
                <div className=" flex justify-end gap-5 mt-5">
                  {/* <DialogClose>
                    <Button asChild variant={"ghost"}
                      className="bg-gray-500 text-white hover:bg-gray-600">
                      Cancel
                    </Button>
                  </DialogClose> */}
                  <Button
                    variant={"outline"}
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => setOpenDailog(false)}
                  >
                    cancel
                  </Button>

                  <Button
                    disabled={!topic || !selectTeacher || loading}
                    onClick={OnClickNext}
                  >
                    {loading && <LoaderCircle className="animate-spin" />}
                    Next
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserInputDailog;
