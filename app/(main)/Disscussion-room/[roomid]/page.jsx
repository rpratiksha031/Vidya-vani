"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState, useRef, useContext } from "react";
import { api } from "../../../../convex/_generated/api";

import modules from "../../../../services/Options";
import { UserButton } from "@stackframe/stack";
import { Button } from "../../../../components/ui/button";
import WebcamPermissionButton from "../../../../services/WebCamEnable";
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
import AIModelFeedback from "@/services/GenerateFeedback";
import { LoaderCircle, Volume2, VolumeX } from "lucide-react";
import { UserContext } from "@/app/_context/UserContext";
import Webcam from "react-webcam";

export default function DiscussionRoom() {
  const { roomid } = useParams();
  const [expert, setExpert] = useState();

  // Fixed context usage - get the context value properly
  const userContextValue = useContext(UserContext);
  // Handle different potential context structures
  const userData =
    userContextValue?.userData ||
    userContextValue?.user ||
    userContextValue ||
    {};
  const setUserData = userContextValue?.setUserData || (() => {});

  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const chatContainerRef = useRef(null);
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ignoreTranscript, setIgnoreTranscript] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(null);

  // for feedback and notes
  const [enablefeedbackNotes, setEnableFeedbackNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const updateConversationMutation = useMutation(
    api.DiscussionRoom.updateConversation
  );

  const { Teachers, ExpertsList } = modules;
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });
  const updateUserToken = useMutation(api.users.UpdateUserToken);

  // Check microphone availability when component mounts
  useEffect(() => {
    const checkMicrophoneAvailability = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // If we got here, microphone is available
        setMicrophoneAvailable(true);
        // Clean up the stream
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Microphone not available:", error);
        setMicrophoneAvailable(false);
      }
    };

    checkMicrophoneAvailability();
  }, []);

  // Load conversation from database when component mounts
  useEffect(() => {
    if (DiscussionRoomData && DiscussionRoomData.conversation) {
      // Ensure conversation is an array before setting it
      setConversation(
        Array.isArray(DiscussionRoomData.conversation)
          ? DiscussionRoomData.conversation
          : []
      );
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

  // Generate feedback notes
  const GenerateFeedbackNotes = async () => {
    setLoading(true);
    try {
      // Ensure we have a conversation array to pass
      const conversationToUse = Array.isArray(conversation) ? conversation : [];

      const result = await AIModelFeedback(
        DiscussionRoomData.subjectOption,
        conversationToUse
      );
      console.log(result);

      if (result && !result.error) {
        setFeedbackContent(result.content);
        setShowFeedback(true);

        // Save the feedback to your database if needed
        try {
          await updateConversationMutation({
            id: roomid,
            feedback: result.content,
          });
          console.log("Feedback saved to database successfully");
        } catch (dbError) {
          console.error("Error saving feedback to database:", dbError);
        }
      } else {
        // Handle error case
        console.error("Error generating feedback:", result?.content);
        setFeedbackContent(
          "Sorry, there was an error generating feedback. Please try again."
        );
        setShowFeedback(true);
      }
    } catch (error) {
      console.error("Error in GenerateFeedbackNotes:", error);
      setFeedbackContent(
        "An unexpected error occurred while generating feedback."
      );
      setShowFeedback(true);
    } finally {
      setLoading(false);
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

    // Ensure conversation is an array before adding to it
    const currentConversation = Array.isArray(conversation) ? conversation : [];

    // Add user message to conversation
    const userMessage = { role: "user", content: userText };
    const updatedConversation = [...currentConversation, userMessage];
    setConversation(updatedConversation);
    setEnableFeedbackNotes(true);

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

  // Function to handle start button click with microphone check
  const handleStartClick = () => {
    // Don't allow starting listening while AI is speaking
    if (isSpeaking) return;

    // Check if microphone is available
    if (microphoneAvailable === false) {
      // Show alert if microphone is not available
      alert(
        "Microphone not available. Please check your microphone permissions and connection."
      );
      return;
    }

    // If we don't know microphone status yet, check it first
    if (microphoneAvailable === null) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Microphone is available
          setMicrophoneAvailable(true);
          // Clean up the stream
          stream.getTracks().forEach((track) => track.stop());

          // Now start listening
          startListening();
        })
        .catch((error) => {
          console.error("Microphone not available:", error);
          setMicrophoneAvailable(false);
          alert(
            "Microphone not available. Please check your microphone permissions and connection."
          );
        });
    } else {
      // We already know microphone is available, so start listening
      startListening();
    }
  };

  // Helper function to start listening
  const startListening = () => {
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

  // for token - fixed to safely handle userData
  useEffect(() => {
    const updateUseTokenMethod = async () => {
      if (userData && userData._id) {
        const tokenCount = conversation?.length > 0 ? 1 : 0;

        try {
          await updateUserToken({
            id: userData._id,
            credits: Number(userData.credits || 0) - Number(tokenCount),
          });

          // Only update the userData if setUserData is a function
          if (typeof setUserData === "function") {
            setUserData((prev) => ({
              ...prev,
              credits: Number(prev?.credits || 0) - Number(tokenCount),
            }));
          }
        } catch (error) {
          console.error("Error updating user token:", error);
        }
      }
    };

    updateUseTokenMethod();
  }, [conversation, userData, updateUserToken, setUserData]);

  // loadding
  if (loading1) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin" size={50} />
      </div>
    );
  }
  if (!DiscussionRoomData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin" size={50} />
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h2 className="text-lg font-bold underline ">
        {DiscussionRoomData?.subjectOption}
      </h2>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 relative">
          <div className="h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center ">
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
            <div className="">
              <Select
                value={selectedVoice?.voiceURI}
                onValueChange={handleVoiceChange}
              >
                <SelectTrigger className="bg-yellow-100 w-20 h-[2px]">
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
            {/* 
            <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
              <UserButton />
            </div>
            <div> */}
            {DiscussionRoomData?.subjectOption == "Mock interview" && (
              <div className="gap-5  items-center h-screen ">
                <Webcam
                  height={500}
                  width={500}
                  className="rounded-2xl bg-gray-800 mb-2 "
                />
                <div className="justify-self-center">
                  <WebcamPermissionButton className="ml-15" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 items-center justify-center grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-5 mx-9">
            <p className="text-gray-500 bg-gray-200 rounded-3xl px-2  ">
              {listening ? "Listening..." : "Click to Start"}
              {isProcessing && " (Processing...)"}
              {isSpeaking && " (Speaking...)"}
            </p>

            <Button
              onClick={handleStartClick}
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
              className="bg-red-500 hover:bg-red-600 "
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
              {!Array.isArray(conversation) || conversation.length === 0 ? (
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

          {/* Feedback/Notes Section */}
          <div className="mt-5">
            {!enablefeedbackNotes ? (
              <p className="text-black text-sm   rounded-3xl px-2">
                At the end of your conversation, we will automatically generate
                feedback/notes from your conversation.
              </p>
            ) : (
              <div>
                {!showFeedback ? (
                  <Button
                    onClick={GenerateFeedbackNotes}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading && <LoaderCircle className="animate-spin mr-2" />}
                    Generate Feedback/Notes
                  </Button>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 mt-3">
                    <h3 className="font-medium mb-2">Session Feedback</h3>
                    <div className="whitespace-pre-line text-sm">
                      {feedbackContent}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        onClick={() => setShowFeedback(false)}
                        variant="outline"
                        size="sm"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(feedbackContent);
                          alert("Feedback copied to clipboard!");
                        }}
                        size="sm"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
