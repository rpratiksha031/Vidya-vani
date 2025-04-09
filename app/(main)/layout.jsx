import React from "react";
import AppHeader from "./_components/AppHeader";
function DashboardLayout({ children }) {
  const currentYear = new Date().getFullYear();
  return (
    <div>
      <AppHeader />

      <div className="mt-20 md:px-20 lg:px-32 xl:px-48 2xl:px-56  ">
        {children}
      </div>

      <footer className="w-full py-4 sm:py-6 mt-8 text-center text-white text-sm border-t border-gray-200 bg-white/30 backdrop-blur-sm bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-blue-950  ">
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

export default DashboardLayout;
