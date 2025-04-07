import { usePhraseCycle } from "../../hooks/usePhraseCycle"

export default function RequestLoader() {
  const loadingPhrases = [
    "Analyzing magical spells...",
    "Decodifying magic diagrams...",
    "Discovering magical entities...",
    "Casting high-level spells...",
    "Casting Wingardium Leviosa on magical books...",
    "Welcome young sorcerer...",
  ]
  const phrases = usePhraseCycle(loadingPhrases)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="relative">
        <img
          src="/loading.webp"
          alt="Imágen de una varita lanzando un hechizo"
          className="size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm">
            {phrases}
          </div>
        </div>
      </div>
    </div>
  )
}
