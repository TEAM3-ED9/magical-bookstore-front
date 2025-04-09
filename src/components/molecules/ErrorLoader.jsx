import { usePhraseCycle } from "../../hooks/usePhraseCycle"

export default function ErrorLoader({ finalRetry }) {
  const errorPhrases = [
    "¡Oh no! A dementor has attacked the library...",
    "¡Expecto Patronum! Containing the dementor...",
    "¡Reparo! Repairing magic vulnerabilities...",
    "¡Tempus Renovato! Recharging magical time...",
    "¡Anapneo! Clearing old spells...",
  ]
  const phrases = usePhraseCycle(errorPhrases)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="relative">
        <img
          src="/dementor.webp"
          alt="Imágen de una varita lanzando un hechizo"
          className="size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm">
            {!finalRetry && phrases}
            {finalRetry &&
              "Oh no! A dementor has broken our spell... We can't find the books..."}
          </div>
        </div>
      </div>
    </div>
  )
}
