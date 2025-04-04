import { useState } from "react"
import BookSpine from "@/components/BookSpine"
import BookPopup from "@/components/BookPopup"
import useSWR from "swr"
import { BACKEND_URL } from "@/lib/constants"
import { fetcher } from "@/lib/utils"
import { usePhraseCycle } from "../hooks/usePhraseCycle"
import { DURATION_MS } from "@/lib/constants"

const loadingPhrases = [
  "Analizando hechizos mágicos...",
  "Decodificando diagramas mágicos...",
  "Descubriendo entidades mágicas...",
  "Conjurando hechizos de alto nivel...",
  "Lanzando Wingardium Leviosa a los libros mágicos...",
  "Bienvenido joven hechizero...",
]

const reloadErrorPhrases = [
  "¡Oh no! Un dementor ha atacado la blioteca",
  "¡Expecto Patronum! Conteniendo al dementor",
  "¡Reparo! Reparando vulnerabilidades mágicas",
  "¡Tempus Renovato! Recargando el tiempo mágico",
  "¡Anapneo! Limpiando hechizos viejos",
]

export default function BookShelf() {
  const [activeBook, setActiveBook] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const {
    data: books,
    error,
    isLoading,
  } = useSWR(BACKEND_URL, fetcher, {
    errorRetryInterval: (DURATION_MS * 2) / reloadErrorPhrases.length,
  })
  const loadingPhrase = usePhraseCycle(loadingPhrases)
  const reloadErrorPhrase = usePhraseCycle(reloadErrorPhrases)

  const handleBookHover = (id, event) => {
    const element = event
    const rect = element.currentTarget.getBoundingClientRect()

    setActiveBook(id)
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleBookLeave = () => {
    setActiveBook(null)
  }

  return (
    <div className="relative min-h-[calc(100vh-16rem)]">
      {!isLoading && error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="relative">
            <img
              src="/public/dementor.webp"
              alt="Imágen de una varita lanzando un hechizo"
              className="size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm">
                {reloadErrorPhrase}
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoading && !error ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="relative">
            <img
              src="/public/loading.webp"
              alt="Imágen de una varita lanzando un hechizo"
              className="size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm">
                {loadingPhrase}
              </div>
            </div>
          </div>
        </div>
      ) : (
        !error && (
          <>
            <div className="bg-[#5D4037] p-4 rounded-lg shadow-xl">
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1 md:gap-2">
                {books.map((book) => (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onMouseEnter={(e) => handleBookHover(book.id, e)}
                    onMouseLeave={handleBookLeave}
                  />
                ))}
              </div>
            </div>
            {activeBook !== null && books.find((b) => b.id === activeBook) && (
              <BookPopup
                book={books.find((b) => b.id === activeBook)}
                position={popupPosition}
              />
            )}
          </>
        )
      )}
    </div>
  )
}
