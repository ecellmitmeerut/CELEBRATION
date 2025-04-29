interface CurtainEffectProps {
  isOpen: boolean
}

export default function CurtainEffect({ isOpen }: CurtainEffectProps) {
  return (
    <>
      <div
        className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-black/95 to-black/80 backdrop-blur-md z-20 transition-transform duration-2000 ease-in-out ${
          isOpen ? "translate-x-[-100%]" : "translate-x-0"
        }`}
      />
      <div
        className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/95 to-black/80 backdrop-blur-md z-20 transition-transform duration-2000 ease-in-out ${
          isOpen ? "translate-x-[100%]" : "translate-x-0"
        }`}
      />
    </>
  )
}
