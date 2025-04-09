"use client";

import { useState, useRef } from "react";
import { Video, VideoOff } from "lucide-react"; // Icons for on/off

function WebcamPermissionButton() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoStreamRef = useRef(null); // Store webcam stream

  const toggleCamera = async () => {
    if (!isCameraOn) {
      // Turn ON camera (request permission only once)
      try {
        if (!videoStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoStreamRef.current = stream;
        }
        setIsCameraOn(true);
        alert("✅ Camera is ON!");
      } catch (error) {
        alert("❌ Camera access denied! Please allow camera permission.");
      }
    } else {
      // Turn OFF camera without asking permission again
      videoStreamRef.current?.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null; // Reset stream
      setIsCameraOn(false);
      alert("🚫 Camera is OFF!");
    }
  };

  return (
    <button
      onClick={toggleCamera}
      className={`p-3 rounded-full shadow-lg transition ${
        isCameraOn
          ? "bg-red-500 hover:bg-red-600"
          : "bg-blue-500 hover:bg-blue-600"
      } text-white`}
    >
      {isCameraOn ? <VideoOff size={24} /> : <Video size={24} />}
    </button>
  );
}

export default WebcamPermissionButton;
