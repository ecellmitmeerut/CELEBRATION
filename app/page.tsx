"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Volume2, VolumeX, Play, SkipForward } from "lucide-react"
import Confetti from "react-confetti"
import Fireworks from "@/components/fireworks"
import CountdownTimer from "@/components/countdown-timer"
import CurtainEffect from "@/components/curtain-effect"
import LightEffect from "@/components/light-effect"
import VirtualAssistant from "@/components/virtual-assistant"

export default function WelcomePage() {
  const [timeLeft, setTimeLeft] = useState(5)
  const [showCurtain, setShowCurtain] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantStep, setAssistantStep] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const [speechSynthesisText, setSpeechSynthesisText] = useState<string | null>(null)

  const bgMusicRef = useRef<HTMLAudioElement>(null)
  const fireworkSoundRef = useRef<HTMLAudioElement>(null)
  const assistantVoiceRef = useRef<HTMLAudioElement>(null)
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
    // Start countdown only if user has interacted and assistant intro is complete
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
    // Show assistant after interaction
    if (hasInteracted) {
      setShowAssistant(true)
      // Start background music at very low volume when interaction begins
      startBackgroundMusic(0.01)
    }
  }, [hasInteracted])

  // Start background music when countdown begins
  useEffect(() => {
    if (countdownStarted && bgMusicRef.current) {
      // Gradually increase volume during countdown
      fadeInBackgroundMusic()
    }
  }, [countdownStarted])

  useEffect(() => {
    // Update audio mute state
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted
    }
    if (fireworkSoundRef.current) {
      fireworkSoundRef.current.muted = isMuted
    }
    if (assistantVoiceRef.current) {
      assistantVoiceRef.current.muted = isMuted
    }
  }, [isMuted])

  // Handle assistant dialogue steps
  useEffect(() => {
    if (!showAssistant) return

    const dialogues = [
      {
        text: "Hello! I'm your AI assistant from E-Cell MITMUF. Welcome to our digital space!",
        duration: 5000,
        audio: "/audio/intro1.mp3",
      },
      {
        text: "E-Cell is the Entrepreneurship Cell of MIT Muzaffarpur, dedicated to fostering innovation and entrepreneurial spirit among students.",
        duration: 8000,
        audio: "/audio/intro2.mp3",
      },
      {
        text: "We provide mentorship, resources, and networking opportunities to help transform innovative ideas into successful ventures.",
        duration: 7000,
        audio: "/audio/intro3.mp3",
      },
      {
        text: "Now, it's time to launch and introduce our website! Get ready for the countdown...",
        duration: 5000,
        audio: "/audio/intro4.mp3",
      },
    ]

    if (assistantStep < dialogues.length) {
      // Play the current dialogue audio
      if (assistantVoiceRef.current) {
        setIsSpeaking(true)

        // Use a synthetic voice as fallback if audio files aren't available
        const playAudio = async () => {
          try {
            assistantVoiceRef.current!.src = dialogues[assistantStep].audio

            // Force a reload of the audio element
            assistantVoiceRef.current!.load()

            const playPromise = assistantVoiceRef.current!.play()

            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log("Audio play error:", error)
                // If audio file fails, use speech synthesis as fallback
                setSpeechSynthesisText(dialogues[assistantStep].text)
              })
            }
          } catch (err) {
            console.log("Audio setup error:", err)
            // Use speech synthesis as fallback
            setSpeechSynthesisText(dialogues[assistantStep].text)
          }
        }

        playAudio()

        // Listen for audio end
        const handleAudioEnd = () => {
          setIsSpeaking(false)
          // Move to next dialogue after audio ends
          setTimeout(() => {
            setAssistantStep((prev) => prev + 1)
          }, 500) // Small pause between dialogues
        }

        assistantVoiceRef.current.onended = handleAudioEnd

        // Fallback timer in case audio doesn't play or end event doesn't fire
        const timer = setTimeout(() => {
          if (assistantVoiceRef.current) {
            assistantVoiceRef.current.onended = null
          }
          setIsSpeaking(false)
          setAssistantStep((prev) => prev + 1)
        }, dialogues[assistantStep].duration + 1000)

        return () => {
          clearTimeout(timer)
          if (assistantVoiceRef.current) {
            assistantVoiceRef.current.onended = null
          }
        }
      }
    } else {
      // Start countdown after assistant dialogue is complete
      setCountdownStarted(true)
    }
  }, [showAssistant, assistantStep])

  // Fallback speech synthesis if audio files don't work
  const useSpeechSynthesis = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try to use a female voice if available
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.includes("female") ||
          voice.name.includes("Female") ||
          voice.name.includes("Google UK English Female") ||
          voice.name.includes("Samantha"),
      )

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setTimeout(() => {
          setAssistantStep((prev) => prev + 1)
        }, 500)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      // If speech synthesis is not available, just use the timer
      setTimeout(() => {
        setIsSpeaking(false)
        setAssistantStep((prev) => prev + 1)
      }, 5000)
    }
  }, [])

  useEffect(() => {
    if (speechSynthesisText) {
      useSpeechSynthesis(speechSynthesisText)
      setSpeechSynthesisText(null)
    }
  }, [speechSynthesisText, useSpeechSynthesis])

  const startBackgroundMusic = (initialVolume = 0.01) => {
    try {
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = initialVolume
        bgMusicRef.current.play().catch((error) => {
          console.log("Background music autoplay prevented:", error)
        })
      }
    } catch (error) {
      console.log("Background music error:", error)
    }
  }

  const fadeInBackgroundMusic = () => {
    // Clear any existing interval
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current)
    }

    // Start with low volume
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.05
    }

    // Gradually increase volume
    volumeIntervalRef.current = setInterval(() => {
      if (bgMusicRef.current && bgMusicRef.current.volume < 0.3) {
        bgMusicRef.current.volume += 0.01
      } else {
        // Clear interval when target volume is reached
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current)
          volumeIntervalRef.current = null
        }
      }
    }, 200)
  }

  const startExperience = () => {
    setHasInteracted(true)
  }

  const skipIntro = () => {
    // Skip to countdown
    setAssistantStep(4) // Set to end of dialogues
    setCountdownStarted(true)

    // Make sure background music is playing
    fadeInBackgroundMusic()
  }

  const openCurtain = () => {
    // Ensure background music is at full volume when curtain opens
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.3
    }

    // Show welcome text and logo
    setShowWelcome(true)

    // Open curtain
    setShowCurtain(false)

    // After curtain opens, show iframe and play firework sound
    setTimeout(() => {
      setShowConfetti(true)
      setShowFireworks(true)

      if (fireworkSoundRef.current) {
        fireworkSoundRef.current.play().catch(() => {
          console.log("Firework sound autoplay prevented.")
        })
      }

      setShowIframe(true)

      // Hide welcome text and logo after iframe appears
      setTimeout(() => {
        setShowWelcome(false)

        // Keep fireworks for longer (15 seconds total)
        setTimeout(() => {
          setShowFireworks(false)
        }, 12000) // Additional 12 seconds after iframe appears
      }, 3000)
    }, 1500)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Get current assistant dialogue
  const getCurrentDialogue = () => {
    const dialogues = [
      "Hello! I'm your AI assistant from E-Cell MITMUF. Welcome to our digital space!",
      "E-Cell is the Entrepreneurship Cell of MIT Muzaffarpur, dedicated to fostering innovation and entrepreneurial spirit among students.",
      "We provide mentorship, resources, and networking opportunities to help transform innovative ideas into successful ventures.",
      "Now, it's time to launch and introduce our website! Get ready for the countdown...",
    ]

    return assistantStep < dialogues.length ? dialogues[assistantStep] : ""
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

      {/* Assistant Voice */}
      <audio ref={assistantVoiceRef} preload="auto" />

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
              E-Cell MITMUF
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

      {/* Skip Intro Button */}
      {showAssistant && !countdownStarted && (
        <button
          onClick={skipIntro}
          className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all border border-white/20 flex items-center gap-1"
        >
          <SkipForward size={16} />
          <span className="text-sm">Skip</span>
        </button>
      )}

      {/* Virtual Assistant */}
      {showAssistant && !countdownStarted && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
          <VirtualAssistant isSpeaking={isSpeaking} />

          <div className="mt-8 max-w-2xl bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 shadow-glow">
            <p className="text-white text-xl text-center leading-relaxed typing-animation">{getCurrentDialogue()}</p>

            {assistantStep >= 3 && (
              <div className="mt-4 flex justify-center">
                <div className="animate-pulse text-blue-400 flex items-center">
                  <span>Preparing countdown</span>
                  <span className="ml-2 flex">
                    <span className="animate-bounce mx-0.5">.</span>
                    <span className="animate-bounce mx-0.5 delay-100">.</span>
                    <span className="animate-bounce mx-0.5 delay-200">.</span>
                  </span>
                </div>
              </div>
            )}
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
            } drop-shadow-[0_0_15px_rgba(123,97,255,0.5)]`}
          />
          <div
            className={`absolute top-[25%] w-full text-center z-20 transition-all duration-1000 ${
              showWelcome ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 px-4 drop-shadow-[0_0_10px_rgba(123,97,255,0.5)]">
              Welcome to E-Cell MITMUF
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
      {showFireworks && <Fireworks />}

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
          <iframe src="https://ecell.mitmuf.com" className="w-full h-full border-none" title="E-Cell MITMUF Website" />
        )}
      </div>
    </div>
  )
}
