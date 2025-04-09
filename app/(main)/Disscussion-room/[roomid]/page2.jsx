"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { api } from "../../../../convex/_generated/api";

import modules from "../../../../services/Options";
import { UserButton } from "@stackframe/stack";
import { Button } from "../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import AIModel from "../../../../services/GlobalServices";
import { Volume2, VolumeX } from "lucide-react";

function DiscussionRoom() {
  const { roomid } = useParams();
  const [expert, setExpert] = useState();
  const [conversation, setConversation] = useState([]); // Store conversation history
  const [isProcessing, setIsProcessing] = useState(false); // Track AI processing state
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState(""); // Track last processed transcript
  const [messageContent, setMessageContent] = useState(""); // Store the latest AI response for TTS
  const chatContainerRef = useRef(null); // Reference for chat auto-scroll
  const [currentUserInput, setCurrentUserInput] = useState(""); // Track current input for UI display
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if speech synthesis is active
  const [ignoreTranscript, setIgnoreTranscript] = useState(false); // Control whether to update input field
  const [availableVoices, setAvailableVoices] = useState([]); // Store available voices
  const [selectedVoice, setSelectedVoice] = useState(null); // Store selected voice

  const updateConversationMutation = useMutation(
    api.DiscussionRoom.updateConversation
  );

  const { Teachers } = modules;
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  // Load conversation from database when component mounts
  useEffect(() => {
    if (DiscussionRoomData && DiscussionRoomData.conversation) {
      setConversation(DiscussionRoomData.conversation);
    }
  }, [DiscussionRoomData]);

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        setAvailableVoices(voiceList);

        // Set default voice based on expert gender or first female voice if available
        const expertGender = expert?.gender?.toLowerCase() || "";
        let defaultVoice = null;

        if (expertGender === "female") {
          defaultVoice = voiceList.find(
            (voice) =>
              voice.name.toLowerCase().includes("female") ||
              voice.name.toLowerCase().includes("woman")
          );
        } else if (expertGender === "male") {
          defaultVoice = voiceList.find(
            (voice) =>
              voice.name.toLowerCase().includes("male") ||
              voice.name.toLowerCase().includes("man")
          );
        }

        // If no matching gender voice found, try to get a voice matching the expert's language
        if (!defaultVoice && expert?.language) {
          defaultVoice = voiceList.find((voice) =>
            voice.lang.startsWith(expert.language)
          );
        }

        // Fallback to first voice if no specific voice found
        setSelectedVoice(defaultVoice || voiceList[0]);
      }
    };

    // Load voices initially
    loadVoices();

    // Set up event listener for when voices are changed/loaded
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup event listener
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [expert]);

  // Speech recognition setup with customized callback
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    clearTranscriptOnListen: false,
  });

  // Update current input when transcript changes, but only when we want user input
  useEffect(() => {
    if (
      transcript &&
      listening &&
      !ignoreTranscript &&
      !isProcessing &&
      !isSpeaking
    ) {
      setCurrentUserInput(transcript);
    }
  }, [transcript, listening, ignoreTranscript, isProcessing, isSpeaking]);

  // Function to stop speech synthesis
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Function to save conversation to database
  const saveConversationToDatabase = async (updatedConversation) => {
    try {
      await updateConversationMutation({
        id: roomid,
        conversation: updatedConversation,
      });
      console.log("Conversation saved to database successfully");
    } catch (error) {
      console.error("Error saving conversation to database:", error);
    }
  };

  // Process user input
  const processUserInput = async (userText) => {
    if (!userText || isProcessing || !DiscussionRoomData) return;

    // Set flags to prevent transcript from showing in input field
    setIsProcessing(true);
    setIgnoreTranscript(true);
    setLastProcessedTranscript(userText);

    // Add user message to conversation
    const userMessage = { role: "user", content: userText };
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);

    // Save conversation with user message to database
    await saveConversationToDatabase(updatedConversation);

    // Clear the input area after submitting
    resetTranscript();
    setCurrentUserInput("");

    try {
      console.log("Calling AI with:", {
        topic: DiscussionRoomData.topic,
        subject: DiscussionRoomData.subjectOption,
        message: userText,
      });

      // Temporarily stop listening while processing
      if (listening) {
        SpeechRecognition.stopListening();
      }

      // Call the AI model with the expected parameters
      const response = await AIModel(
        DiscussionRoomData.topic,
        DiscussionRoomData.subjectOption,
        userText
      );

      console.log("AI response received:", response);

      // Add AI response to conversation
      let content = "";
      if (typeof response === "string") {
        content = response;
      } else if (response && response.content) {
        content = response.content;

        // Handle error responses
        if (response.error === true) {
          content =
            "Sorry, I encountered an error processing your message. Please try again.";
        }
      } else {
        content =
          "I received your message but couldn't generate a proper response.";
      }

      // Add to conversation and update database
      const aiMessage = { role: "system", content: content };
      const newUpdatedConversation = [...updatedConversation, aiMessage];
      setConversation(newUpdatedConversation);

      // Save conversation with AI response to database
      await saveConversationToDatabase(newUpdatedConversation);

      // Then trigger speech after adding to conversation
      setMessageContent(content); // Set the content for TTS to use
      setIsSpeaking(true); // Set speaking state to true
    } catch (error) {
      console.error("Error processing user input:", error);

      // Add error message to conversation and update database
      const errorMessage = {
        role: "system",
        content:
          "Sorry, I encountered an error processing your message. Please try again later.",
      };
      const errorUpdatedConversation = [...updatedConversation, errorMessage];
      setConversation(errorUpdatedConversation);

      // Save conversation with error message to database
      await saveConversationToDatabase(errorUpdatedConversation);

      setMessageContent(errorMessage.content); // Set error message for TTS
      setIsSpeaking(true); // Set speaking state to true
    } finally {
      setIsProcessing(false);
      // Reset ignore flag after speech is complete (in the speech end handler)
    }
  };

  // Handle manual submission
  const handleManualSubmit = () => {
    if (transcript && !isProcessing) {
      processUserInput(transcript);
    }
  };

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

  // Text-to-speech effect
  useEffect(() => {
    if (messageContent && isSpeaking && selectedVoice) {
      console.log("Speaking:", messageContent);

      // Create speech utterance with selected voice
      const speech = new SpeechSynthesisUtterance(messageContent);

      // Set the selected voice
      speech.voice = selectedVoice;

      // Adjust pitch slightly based on gender (optional)
      if (
        selectedVoice.name.toLowerCase().includes("female") ||
        selectedVoice.name.toLowerCase().includes("woman")
      ) {
        speech.pitch = 1.1; // Slightly higher pitch for female voices
      } else {
        speech.pitch = 1.0; // Default pitch
      }

      speech.onend = () => {
        setIsSpeaking(false);
        setIgnoreTranscript(false); // Re-enable transcript update after speech ends

        // Clear any transcript that might have accumulated during AI speech
        resetTranscript();
      };

      speech.onerror = () => {
        setIsSpeaking(false);
        setIgnoreTranscript(false); // Re-enable transcript update after speech error

        // Clear any transcript that might have accumulated during AI speech
        resetTranscript();
      };

      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(speech);
    }
  }, [messageContent, isSpeaking, selectedVoice]);

  // Handle voice selection change
  const handleVoiceChange = (voiceUri) => {
    const voice = availableVoices.find((v) => v.voiceURI === voiceUri);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

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

            <h2 className="text-gray-500">{expert?.name}</h2>

            {/* Voice Selection */}
            <div className="mt-4 w-64">
              <Select
                value={selectedVoice?.voiceURI}
                onValueChange={handleVoiceChange}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-5">
            <p className="text-gray-500 bg-gray-200 rounded-3xl px-2">
              {listening ? "Listening..." : "Click to Start"}
              {isProcessing && " (Processing...)"}
              {isSpeaking && " (Speaking...)"}
            </p>

            <Button
              onClick={() => {
                // Don't allow starting listening while AI is speaking
                if (isSpeaking) return;

                // Clear transcript before starting if there's existing content
                if (transcript && !listening) {
                  resetTranscript();
                  setCurrentUserInput("");
                }
                setIgnoreTranscript(false);
                SpeechRecognition.startListening({
                  continuous: true,
                  language: "en-US",
                });
              }}
              disabled={isProcessing || isSpeaking}
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
              disabled={!transcript || isProcessing || isSpeaking}
              className="bg-green-500 hover:bg-green-600"
            >
              Submit
            </Button>

            {isSpeaking && (
              <Button
                onClick={stopSpeech}
                className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1"
              >
                <VolumeX size={16} /> Stop Audio
              </Button>
            )}
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
