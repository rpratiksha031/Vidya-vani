"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { UserButton } from "@stackframe/stack";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

export default function Home() {
  const [showUserButton, setShowUserButton] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const User = useUser();

  // console.log("User in first page", User);
  // console.log("primary_mail ", User?.primaryEmailVerified);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Redirect to dashboard if the user is already signed in and verified
  useEffect(() => {
    if (User?.primaryEmailVerified === true) {
      // console.log("User is verified, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [User, router]);

  const handleGetStarted = () => {
    setShowUserButton(true);
  };

  // Handle user sign in and navigation to dashboard
  const handleSignIn = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center py-8 md:py-12 ">
        {showUserButton ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className=" bg-cyan-200 rounded-lg p-6 sm:p-8 md:p-10  shadow-xl flex flex-col items-center w-full max-w-md mx-auto"
          >
            {User?.primaryEmailVerified === true ? (
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
                Welcome Back! {User?.displayName}
              </h2>
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
                Welcome! Please Sign in
              </h2>
            )}
            <div className="mb-6 flex justify-center">
              {/* Styled UserButton with custom button appearance */}
              <div className="rounded-full p-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all">
                <UserButton onSignIn={handleSignIn} variant="secondary" />
              </div>
            </div>
            <div className="flex flex-col w-full gap-3">
              {User?.primaryEmailVerified === true && (
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Dashboard
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowUserButton(false)}
                className="w-full rounded-2x bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300"
              >
                Go Back
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center w-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="px-4 sm:px-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 tracking-tight animate-pulse">
                Welcome to{" "}
                <span className="text-cyan-600 font-bold">VidyaVani</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Your all-in-one platform for seamless communication and
                productivity.
              </p>
            </motion.div>

            <motion.div
              className="relative mb-8 sm:mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="w-full max-w-4xl h-56 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 rounded-xl md:rounded-2xl overflow-hidden shadow-lg relative mx-auto">
                <div className="absolute inset-0 bg-black opacity-20 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: animationComplete ? [1, 1.05, 1] : 1 }}
                    transition={{
                      duration: 0.8,
                      repeat: animationComplete ? Infinity : 0,
                      repeatType: "reverse",
                      repeatDelay: 5,
                    }}
                    className="text-white text-xl md:text-3xl font-bold px-4 text-center backdrop-blur-sm bg-black/10 py-3 rounded-full"
                  >
                    Discover the Experience
                  </motion.div>
                </div>

                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white opacity-20"
                    style={{
                      width: `${Math.floor(Math.random() * 16) + 8}px`,
                      height: `${Math.floor(Math.random() * 16) + 8}px`,
                    }}
                    initial={{
                      x: Math.random() * 100 - 50,
                      y: Math.random() * 100 - 50,
                      opacity: 0.3,
                    }}
                    animate={{
                      x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                      y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: Math.random() * 10 + 10,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mb-12 sm:mb-16"
            >
              <Button
                onClick={handleGetStarted}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
              >
                Sign In / Sign Up
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto px-4"
            >
              {[
                {
                  title: "Seamless Integration",
                  description:
                    "Connect with your favorite tools and services without any hassle.",
                  icon: "✨",
                },
                {
                  title: "Smart Features",
                  description:
                    "AI-powered tools to enhance your productivity and creativity.",
                  icon: "🧠",
                },
                {
                  title: "Secure & Private",
                  description:
                    "Your data is protected with enterprise-grade security systems.",
                  icon: "🔒",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-5 sm:p-6 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Copyright Footer */}
      <footer className="w-full py-4 sm:py-6 mt-8 text-center text-gray-600 text-sm border-t border-gray-200 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {currentYear} VidyaVani. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4 text-xs sm:text-sm">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
