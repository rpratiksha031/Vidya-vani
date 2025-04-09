"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { api } from "../../../../convex/_generated/api";

import modules from "../../../../services/Options";
import { UserButton } from "@stackframe/stack";
import { Button } from "../../../../components/ui/button";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import AIModel from "../../../../services/GlobalServices";

function DiscussionRoom() {
  const { roomid } = useParams();
  const [expert, setExpert] = useState();
  const [conversation, setConversation] = useState([]); // Store conversation history
  const [isProcessing, setIsProcessing] = useState(false); // Track AI processing state
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState(""); // Track last processed transcript
  const chatContainerRef = useRef(null); // Reference for chat auto-scroll
  const [currentUserInput, setCurrentUserInput] = useState(""); // Track current input for UI display

  const { Teachers } = modules;
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    clearTranscriptOnListen: false,
  });

  // Update current input when transcript changes
  useEffect(() => {
    if (transcript) {
      setCurrentUserInput(transcript);
    }
  }, [transcript]);

  // Process user input
  const processUserInput = async (userText) => {
    if (!userText || isProcessing || !DiscussionRoomData) return;

    setIsProcessing(true);
    setLastProcessedTranscript(userText);

    // Add user message to conversation
    const userMessage = { role: "user", content: userText };
    setConversation((prev) => [...prev, userMessage]);

    try {
      console.log("Calling AI with:", {
        topic: DiscussionRoomData.topic,
        subject: DiscussionRoomData.subjectOption,
        message: userText,
      });

      // Call the AI model with the expected parameters
      const response = await AIModel(
        DiscussionRoomData.topic,
        DiscussionRoomData.subjectOption,
        userText
      );

      console.log("AI response received:", response);

      // Add AI response to conversation
      let messageContent = "";

      if (typeof response === "string") {
        messageContent = response;
      } else if (response && response.content) {
        messageContent = response.content;

        // Handle error responses
        if (response.error === true) {
          messageContent =
            "Sorry, I encountered an error processing your message. Please try again.";
        }
      } else {
        messageContent =
          "I received your message but couldn't generate a proper response.";
      }

      const aiMessage = { role: "system", content: messageContent };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing user input:", error);

      // Add error message to conversation
      const errorMessage = {
        role: "system",
        content:
          "Sorry, I encountered an error processing your message. Please try again later.",
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      resetTranscript(); // Reset transcript after processing
      setCurrentUserInput(""); // Clear the current input
    }
  };

  // Handle manual submission
  const handleManualSubmit = () => {
    if (transcript && !isProcessing) {
      processUserInput(transcript);
    }
  };

  // Process transcript when speech recognition stops
  useEffect(() => {
    // Only process if we've stopped listening, have a transcript, and it's different from the last processed one
    if (
      !listening &&
      transcript &&
      transcript !== lastProcessedTranscript &&
      !isProcessing &&
      DiscussionRoomData
    ) {
      processUserInput(transcript);
    }
  }, [
    listening,
    transcript,
    isProcessing,
    DiscussionRoomData,
    lastProcessedTranscript,
  ]);

  // Auto-scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Find and set the expert
  useEffect(() => {
    if (DiscussionRoomData && Teachers) {
      const Expert = Teachers.find(
        (item) => item.name === DiscussionRoomData?.expertName
      );
      if (Expert) {
        setExpert(Expert);
      } else {
        console.warn(
          "No matching expert found for:",
          DiscussionRoomData?.expertName
        );
      }
    }
  }, [DiscussionRoomData, Teachers]);

  // Check for browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <p className="text-center mt-10">
        Your browser does not support speech recognition.
      </p>
    );
  }

  return (
    <div className="mt-5">
      <h2 className="text-lg font-bold">{DiscussionRoomData?.subjectOption}</h2>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
            {expert?.avatar ? (
              <Image
                src={expert.avatar}
                alt="avatar"
                width={200}
                height={200}
                className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
              />
            ) : (
              <div className="h-[80px] w-[80px] rounded-full bg-gray-300 animate-pulse"></div>
            )}
            // we are adding here a audio file
            <h2 className="text-gray-500">{expert?.name}</h2>
            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-5">
            <p className="text-gray-500 bg-gray-200 rounded-3xl px-2">
              {listening ? "Listening..." : "Click to Start"}
              {isProcessing && " (Processing...)"}
            </p>

            <Button
              onClick={() => {
                // Clear transcript before starting if there's existing content
                if (transcript && !listening) {
                  resetTranscript();
                  setCurrentUserInput("");
                }
                SpeechRecognition.startListening({
                  continuous: true,
                  language: "en-US",
                });
              }}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Start
            </Button>

            <Button
              onClick={() => {
                SpeechRecognition.stopListening();
              }}
              disabled={!listening || isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              Stop
            </Button>

            <Button
              onClick={() => {
                resetTranscript();
                setCurrentUserInput("");
              }}
              disabled={isProcessing || !transcript}
            >
              Reset
            </Button>

            <Button
              onClick={handleManualSubmit}
              disabled={!transcript || isProcessing}
              className="bg-green-500 hover:bg-green-600"
            >
              Submit
            </Button>
          </div>

          <div className="mb-5 pb-3">
            <div className="bg-gray-200 px-5 mt-2 py-4 rounded-2xl min-h-[100px]">
              <div>
                <p className={`${currentUserInput ? "" : "text-gray-400"}`}>
                  {currentUserInput || "Your speech will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div
            ref={chatContainerRef}
            className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-stretch p-4 relative overflow-y-auto"
          >
            <h2 className="mb-4 font-medium text-center">Conversation</h2>

            {/* Display conversation history */}
            <div className="flex flex-col space-y-3 overflow-y-auto">
              {conversation.length === 0 ? (
                <p className="text-gray-400 text-center text-sm">
                  Your conversation will appear here. Start speaking to begin.
                </p>
              ) : (
                conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-100 self-end ml-auto"
                        : "bg-gray-100 self-start"
                    } max-w-[85%]`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Processing your request...
              </div>
            )}
          </div>
          <h2 className="mt-5 text-gray-400 text-sm">
            At the end of your conversation, we will automatically generate
            feedback/notes from your conversation.
          </h2>
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;
