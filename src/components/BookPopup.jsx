import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ACCENT_COLOR, DARK_COLOR } from "@/lib/constants"

export default function BookPopup({ book, position }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [book.id])

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={cn(
          "w-64 rounded-lg p-4 shadow-xl",
          "transition-all duration-300 transform",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          "before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2",
          "before:border-8 before:border-transparent"
        )}
        style={{
          backgroundColor: DARK_COLOR,
          borderColor: ACCENT_COLOR,
          borderWidth: "2px",
          boxShadow: `0 10px 25px ${DARK_COLOR}80`,
          "--before-color": ACCENT_COLOR,
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-20 mix-blend-overlay" />
          <div
            className="absolute inset-0"
            style={{
              mixBlendMode: "overlay",
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b to-transparent"
            style={{ from: `${ACCENT_COLOR}10` }}
          />
        </div>

        <div className="relative">
          <div
            className="inline-block px-2 py-1 rounded text-xs font-bold mb-2"
            style={{
              backgroundColor: ACCENT_COLOR,
              color: DARK_COLOR,
            }}
          >
            {book.house}
          </div>

          <h3
            className="font-serif text-lg font-bold mb-1"
            style={{ color: ACCENT_COLOR }}
          >
            {book.title}
          </h3>
          <p className="text-white/80 text-sm mb-1">Por {book.author}</p>

          <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent my-2" />

          <p className="text-white/90 text-sm italic">{book.description}</p>

          <div className="absolute -top-2 -right-2 w-8 h-8">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: `${ACCENT_COLOR}20` }}
            />
            <div
              className="absolute inset-1 rounded-full animate-pulse"
              style={{ backgroundColor: `${ACCENT_COLOR}40` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
