"use client"

import { useEffect, useState, useRef } from "react"
import { Volume2, VolumeX, Play } from "lucide-react"
import Confetti from "react-confetti"
import Fireworks from "@/components/fireworks"
import CountdownTimer from "@/components/countdown-timer"
import CurtainEffect from "@/components/curtain-effect"
import LightEffect from "@/components/light-effect"

export default function WelcomePage() {
  const [timeLeft, setTimeLeft] = useState(5)
  const [showCurtain, setShowCurtain] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const bgMusicRef = useRef<HTMLAudioElement>(null)
  const fireworkSoundRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Start countdown only if user has interacted
    if (countdownStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdownStarted && timeLeft === 0) {
      // Open curtain when countdown reaches 0
      openCurtain()
    }
  }, [timeLeft, countdownStarted])

  useEffect(() => {
    // Try to play background music after user interaction
    if (hasInteracted) {
      playMusic()
    }
  }, [hasInteracted])

  useEffect(() => {
    // Update audio mute state
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted
    }
    if (fireworkSoundRef.current) {
      fireworkSoundRef.current.muted = isMuted
    }
  }, [isMuted])

  const playMusic = async () => {
    try {
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.3
        await bgMusicRef.current.play()
      }
    } catch (error) {
      console.log("Autoplay prevented by browser. User interaction needed.")
    }
  }

  const startExperience = () => {
    setHasInteracted(true)
    setCountdownStarted(true)
    playMusic()
  }

  const openCurtain = () => {
    // Play background music if not already playing
    if (bgMusicRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(() => {
        console.log("Autoplay prevented by browser. User interaction needed.")
      })
    }

    // Show welcome text and logo
    setShowWelcome(true)

    // Open curtain
    setShowCurtain(false)

    // After curtain opens, show iframe and play firework sound
    setTimeout(() => {
      setShowConfetti(true)

      if (fireworkSoundRef.current) {
        fireworkSoundRef.current.play().catch(() => {
          console.log("Autoplay prevented by browser. User interaction needed.")
        })
      }

      setShowIframe(true)

      // Hide welcome text and logo after iframe appears
      setTimeout(() => {
        setShowWelcome(false)
      }, 2000)
    }, 1500)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Music */}
      <audio ref={bgMusicRef} src="https://www.bensound.com/bensound-music/bensound-dubstep.mp3" loop preload="auto" />

      {/* Firework Sound */}
      <audio
        ref={fireworkSoundRef}
        src="https://freesound.org/data/previews/273/273792_5123851-lq.mp3"
        preload="auto"
      />

      {/* Animated Background */}
      <div className="absolute inset-0 z-1">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30"></div>
        <div className="stars"></div>
      </div>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all border border-white/20 shadow-glow"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Start Experience Button (only shown before interaction) */}
      {!hasInteracted && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
          <div className="text-center">
            <div className="mb-8 text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse">
              E-Cell MITMIT
            </div>
            <button
              onClick={startExperience}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full overflow-hidden shadow-glow transition-all duration-300 hover:from-purple-500 hover:to-blue-500 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <Play className="mr-2" size={24} />
                Start Experience
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      {countdownStarted && timeLeft > 0 && <CountdownTimer timeLeft={timeLeft} />}

      {/* Welcome Content */}
      {showWelcome && (
        <>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_of_E-Cell.png"
            alt="E-Cell Logo"
            className={`absolute top-[10%] left-1/2 transform -translate-x-1/2 z-20 w-[180px] transition-all duration-1000 ${
              showWelcome ? "opacity-100 scale-100" : "opacity-0 scale-90"
            } shadow-glow`}
          />
          <div
            className={`absolute top-[25%] w-full text-center z-20 transition-all duration-1000 ${
              showWelcome ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 px-4">
              Welcome to E-Cell MITMIT
            </h1>
            <p className="text-white/80 mt-4 text-lg md:text-xl max-w-2xl mx-auto px-4">
              Empowering innovation and entrepreneurship
            </p>
          </div>
        </>
      )}

      {/* Curtain Effect */}
      <CurtainEffect isOpen={!showCurtain} />

      {/* Light Effect following mouse */}
      <LightEffect />

      {/* Fireworks Background */}
      {showIframe && <Fireworks />}

      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}

      {/* Iframe Container */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-2000 ${
          showIframe ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {showIframe && (
          <iframe
            src="https://ecell.mitmuf.com"
            className="w-full h-full border-none"
            title=""
          />
        )}
      </div>
    </div>
  )
}
