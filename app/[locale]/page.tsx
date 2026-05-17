"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedPorts } from "@/components/landing/featured-ports"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Footer } from "@/components/landing/footer"
import { ChatWidget } from "@/components/landing/chat-widget"
import { TripDrawer } from "@/components/landing/TripDrawer"

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true)
    window.addEventListener("open-chat", handleOpenChat)
    return () => window.removeEventListener("open-chat", handleOpenChat)
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection onOpenChat={() => setIsChatOpen(true)} />
      <HowItWorks />
      <FeaturedPorts />
      <Footer />
      <ChatWidget 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
      <TripDrawer />
    </main>
  )
}
