import { UserContext } from "@/app/_context/UserContext";
import { useUser } from "@stackframe/stack";
import Image from "next/image";
import { useContext } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet2 } from "lucide-react";

function Credits() {
  const { userData } = useContext(UserContext);
  const User = useUser();

  const calculateProgress = () => {
    if (userData?.subscriptionId) {
      return Number(userData?.credits / 50000) * 100;
    } else {
      return (Number(userData?.credits) / 5000) * 100;
    }
  };
  if (!userData) {
    return <div>Loading user data...</div>;
  }
  return (
    <div>
      <div>
        <Image
          src={User.profileImageUrl}
          alt="
        profile"
          width={50}
          height={50}
          className="rounded-full"
        />
        <h2 className="font-bold text-lg">{User?.displayName}</h2>
        <h2>{User?.primaryEmail}</h2>
      </div>
      <hr className="my-3" />

      <div>
        <h2 className="font-bold">Token usage</h2>
        <h2>
          {userData.credits}/{userData?.subscriptionId ? "50,000" : "5000"}
        </h2>
        <Progress value={calculateProgress()} className="my-5" />
        <div className="flex justify-between items-center mt-3">
          <h2 className="font-bold">Current plan</h2>
          <h2 className="p-1 bg-secondary rounded-lg ">
            {" "}
            {userData?.subscriptionId ? "paid plan" : "free plan"}
          </h2>
        </div>

        <div className="mt-5 p-5 rounded-2xl">
          <div className="flex justify-between">
            <h2>Pro plan</h2>
            <h2>50,000 Tokens</h2>
          </div>
          <h2 className="font-bold">$10/month</h2>
        </div>
        <hr className="my-3" />

        <Button className="w-full">
          <Wallet2 className=" mr-2" /> Upgrade $10
        </Button>
      </div>
    </div>
  );
}

export default Credits;
