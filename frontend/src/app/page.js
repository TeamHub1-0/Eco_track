// src/app/page.js
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#212529]">
      <Navbar />
      <Hero />
    </main>
  );
}