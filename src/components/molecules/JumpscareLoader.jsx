import { useCallback } from "react"

export default function JumpscareLoader({ onButtonClick }) {
  const handleButtonClick = useCallback(() => {
    onButtonClick(false)
  }, [onButtonClick])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="relative">
        <img
          src="/dementor.webp"
          alt="Image of a wand casting a spell"
          className="size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full text-xl bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm">
            <p>It seems a dementor is guarding this book...</p>
            <p>Maybe the unlocking spell was wrong?</p>
          </div>
        </div>
        <button
          onClick={handleButtonClick}
          className="mt-4 absolute left-1/2 -translate-x-1/2 px-8 py-2 bg-dark/70 text-white font-bold text-2xl rounded-lg cursor-pointer"
        >
          Try Another Spell
        </button>
      </div>
    </div>
  )
}
