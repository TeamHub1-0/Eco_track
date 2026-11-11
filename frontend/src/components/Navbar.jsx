// src/components/Navbar.jsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#F8F9FA] border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-[#2A9D8F] flex items-center justify-center text-white font-bold text-lg shadow-md">
            🌱
          </div>
          <span className="text-xl font-bold tracking-tight text-[#212529]">
            Eco<span className="text-[#2A9D8F]">Track</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-[#212529] hover:text-[#2A9D8F] transition-colors">
            Home
          </Link>
          <Link href="/map" className="text-sm font-medium text-[#212529] hover:text-[#2A9D8F] transition-colors">
            Pollution Map
          </Link>
          <Link href="/report" className="text-sm font-medium text-[#212529] hover:text-[#2A9D8F] transition-colors">
            Report Waste
          </Link>
          <Link href="/missions" className="text-sm font-medium text-[#212529] hover:text-[#2A9D8F] transition-colors">
            Cleanup Missions
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-[#212529] hover:text-[#2A9D8F] transition-colors">
            Leaderboard
          </Link>
        </nav>

        {/* Action Buttons & EcoPoints Badge */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center bg-[#2A9D8F]/10 px-3 py-1.5 rounded-full border border-[#2A9D8F]/20">
            <span className="text-xs font-semibold text-[#2A9D8F]">⭐ 340 EcoPts</span>
          </div>
          <Link 
            href="/login" 
            className="text-sm font-medium text-[#212529] hover:text-[#2A9D8F] px-3 py-2 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/report" 
            className="bg-[#2A9D8F] hover:bg-[#238276] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            Report Now
          </Link>
        </div>

      </div>
    </header>
  );
}