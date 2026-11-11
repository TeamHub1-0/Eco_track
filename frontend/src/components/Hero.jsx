// src/components/Hero.jsx
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-[#F8F9FA] py-20 lg:py-28 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge tag */}
        <div className="inline-flex items-center space-x-2 bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 px-3.5 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-[#2A9D8F] animate-pulse"></span>
          <span className="text-xs font-semibold text-[#2A9D8F] tracking-wide uppercase">
            Powered by YOLOv8 AI Classification
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#212529] tracking-tight max-w-4xl mx-auto leading-tight">
          Transforming Waste Management Through <span className="text-[#2A9D8F]">Community & AI</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Report local pollution instantly, let our YOLOv8 AI model classify waste, and join community cleanup missions to earn EcoPoints.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            href="/report" 
            className="w-full sm:w-auto bg-[#2A9D8F] hover:bg-[#238276] text-white font-medium px-8 py-3.5 rounded-xl shadow-md transition-all text-base"
          >
            Submit a Report 📸
          </Link>
          <Link 
            href="/map" 
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#212529] border border-gray-300 font-medium px-8 py-3.5 rounded-xl shadow-sm transition-all text-base"
          >
            Explore Pollution Map 🗺️
          </Link>
        </div>

        {/* Quick Impact Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-gray-200">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-[#2A9D8F]">1,250+</p>
            <p className="text-sm text-gray-600 mt-1">Reports Resolved</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-[#2A9D8F]">4.8 Tons</p>
            <p className="text-sm text-gray-600 mt-1">Waste Collected</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-[#2A9D8F]">850+</p>
            <p className="text-sm text-gray-600 mt-1">Active Volunteers</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-[#2A9D8F]">98%</p>
            <p className="text-sm text-gray-600 mt-1">AI Accuracy</p>
          </div>
        </div>

      </div>
    </section>
  );
}