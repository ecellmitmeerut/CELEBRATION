"use client"

import { useEffect, useState } from "react"

export default function LightEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [touchEnabled, setTouchEnabled] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }

    // Check if device supports touch
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setTouchEnabled(true)
      window.addEventListener("touchmove", handleTouchMove)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (touchEnabled) {
        window.removeEventListener("touchmove", handleTouchMove)
      }
    }
  }, [touchEnabled])

  return (
    <div
      className="absolute w-[300px] h-[300px] rounded-full pointer-events-none z-15"
      style={{
        background:
          "radial-gradient(circle, rgba(123, 97, 255, 0.3) 0%, rgba(65, 105, 225, 0.1) 40%, rgba(0,0,0,0) 70%)",
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        transform: "translate(-50%, -50%)",
        filter: "blur(5px)",
      }}
    />
  )
}
