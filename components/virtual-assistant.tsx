"use client"

import { useEffect, useState } from "react"

interface VirtualAssistantProps {
  isSpeaking: boolean
}

export default function VirtualAssistant({ isSpeaking }: VirtualAssistantProps) {
  const [animationState, setAnimationState] = useState(0)

  useEffect(() => {
    // Cycle through animation states when speaking
    let interval: NodeJS.Timeout

    if (isSpeaking) {
      interval = setInterval(() => {
        setAnimationState((prev) => (prev + 1) % 3)
      }, 300) // Faster animation when speaking
    } else {
      // Reset animation state when not speaking
      setAnimationState(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSpeaking])

  return (
    <div className="relative w-64 h-64 mb-4">
      {/* AI Assistant Avatar */}
      <div className="relative w-full h-full">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-b from-purple-600 to-blue-600 ${isSpeaking ? "animate-pulse" : ""}`}
        ></div>

        <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-white/20">
          <img
            src="https://img.freepik.com/premium-vector/female-user-profile-avatar-is-woman-character-screen-saver-with-emotions_505620-617.jpg"
            alt="Virtual Assistant"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated Ring */}
        <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin-slow">
          <div className="absolute top-0 left-1/2 w-4 h-4 -ml-2 -mt-2 bg-blue-500 rounded-full shadow-glow"></div>
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white rounded-full opacity-70 animate-float-${(i % 4) + 1}`}
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Voice Wave Animation */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-blue-400 rounded-full transition-all duration-200 ${
                isSpeaking ? (i === animationState || (i === 2 && animationState !== 2) ? "h-6" : "h-2") : "h-2"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
