"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  timeLeft: number
}

export default function CountdownTimer({ timeLeft }: CountdownTimerProps) {
  const [isZooming, setIsZooming] = useState(false)

  useEffect(() => {
    // Toggle zoom animation on each second
    setIsZooming(true)
    const timer = setTimeout(() => {
      setIsZooming(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [timeLeft])

  return (
    <div
      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-500 ${
        isZooming ? "scale-[1.3]" : "scale-100"
      }`}
    >
      <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 shadow-glow">
        {timeLeft}
      </div>
    </div>
  )
}
