import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function BookPopup({ book, position }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [book.id])
  const isMobile = window.innerWidth <= 768
  const arrowPosition = (position) => {
    const { x } = position

    if (isMobile) {
      if (x <= 150) {
        return "left-[15%] translate-x-[-15%]"
      }

      if (x >= 150 && x <= 260) {
        return "left-[50%] translate-x-[-50%]"
      }

      if (x >= 261) {
        return "right-[15%] translate-x-[15%]"
      }
    } else {
      return "left-1/2 -translate-x-1/2"
    }
  }

  return (
    <div
      className="fixed z-50 -translate-x-1/2 pointer-events-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div
        className={cn(
          "w-64 rounded-lg p-4 book-popup transition-all duration-300 border-2 border-accent bg-dark ",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div
          className={`absolute top-full border-8 border-transparent border-t-accent ${arrowPosition(
            position
          )}`}
          style={{
            content: '""',
          }}
        ></div>
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 mix-blend-overlay" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-accent/10 to-transparent" />
        </div>

        <div className="relative">
          <div className="inline-block px-2 py-1 rounded text-xs font-bold mb-2 bg-accent text-dark">
            {book.house}
          </div>

          <h3 className="font-serif text-lg font-bold mb-1 text-accent">
            {book.title}
          </h3>
          <p className="text-white/80 text-sm mb-1">Por {book.author}</p>

          <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent my-2" />

          <p className="text-white/90 text-sm italic">{book.description}</p>

          <div className="absolute -top-2 -right-2 size-8">
            <div className="absolute inset-0 rounded-full animate-ping bg-accent/20" />
            <div className="absolute inset-1 rounded-full animate-pulse bg-accent/40" />
          </div>
        </div>
      </div>
    </div>
  )
}
