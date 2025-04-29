"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  color: string
  velocity: {
    x: number
    y: number
  }
  alpha: number
  life: number
  size: number
  hue: number
  saturation: number
  lightness: number
}

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create firework particles
    const createFirework = (x: number, y: number) => {
      const hue = Math.random() * 360
      const particleCount = 150

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        const size = Math.random() * 4 + 1
        const saturation = 80 + Math.random() * 20
        const lightness = 50 + Math.random() * 10

        particles.current.push({
          x,
          y,
          color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          alpha: 1,
          life: Math.random() * 80 + 80,
          size,
          hue,
          saturation,
          lightness,
        })
      }
    }

    // Animation loop
    const animate = () => {
      ctx.globalCompositeOperation = "destination-over"
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "lighter"

      // Update and draw particles
      particles.current.forEach((particle, index) => {
        particle.velocity.y += 0.04 // Gravity
        particle.x += particle.velocity.x
        particle.y += particle.velocity.y
        particle.alpha -= 0.006
        particle.life--

        // Fade color as particle ages
        particle.lightness += 0.3

        if (particle.alpha <= 0 || particle.life <= 0) {
          particles.current.splice(index, 1)
        } else {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

          // Create gradient for more realistic glow
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 2,
          )

          gradient.addColorStop(
            0,
            `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.alpha})`,
          )
          gradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0)`)

          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      // Randomly create new fireworks
      if (Math.random() < 0.03) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.5
        createFirework(x, y)
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Initial fireworks
    for (let i = 0; i < 5; i++) {
      createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-5 pointer-events-none" />
}
