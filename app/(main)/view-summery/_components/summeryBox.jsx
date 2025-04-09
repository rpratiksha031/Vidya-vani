"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../components/ui/card";
import { useState } from "react";

function SummaryPage() {
  const { roomid } = useParams();
  const [copied, setCopied] = useState(false);

  // Fetch the discussion room data (including feedback)
  const discussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  // Loading state
  if (!discussionRoomData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading summary...
      </div>
    );
  }

  // Error state - no feedback available
  if (!discussionRoomData.feedback) {
    return (
      <div className="mt-10 p-6">
        <h2 className="text-xl font-bold mb-4">Session Summary</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">
              No feedback is available for this session yet. Please generate
              feedback in the discussion room first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(discussionRoomData.feedback);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Session Summary</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {discussionRoomData.subjectOption} - {discussionRoomData.topic}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {discussionRoomData.feedback}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCopy}>
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional summary statistics or visualizations could go here */}
    </div>
  );
}

export default SummaryPage;
