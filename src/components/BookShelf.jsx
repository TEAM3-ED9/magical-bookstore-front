import { useState } from "react"
import BookSpine from "@/components/BookSpine"
import BookPopup from "@/components/BookPopup"
import useSWR from "swr"
import { BACKEND_URL } from "@/lib/constants"
import { fetcher } from "@/lib/utils"
import { usePhraseCycle } from "../hooks/usePhraseCycle"
import { DURATION_MS } from "@/lib/constants"

/**
 * TODO
 *
 * 1. Status
 * 2. Too many re-renders on hover
 */

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
    <div className="relative">
      {!isLoading && error && (
        <div className="bg-[#5D4037] p-4 rounded-lg shadow-xl">
          <div className="text-center font-extrabold text-white/80 text-sm transition-opacity duration-500">
            {reloadErrorPhrase}
          </div>
        </div>
      )}
      {isLoading && !error ? (
        <div className="bg-[#5D4037] p-4 rounded-lg shadow-xl">
          <div className="text-center font-extrabold text-white/80 text-sm transition-opacity duration-500">
            {loadingPhrase}
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
