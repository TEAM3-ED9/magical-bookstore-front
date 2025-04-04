import { cn } from "@/lib/utils"
import { BOOK_COLOR } from "@/lib/constants"

export default function BookSpine({ book, onMouseEnter, onMouseLeave }) {
  const darkenedColor = BOOK_COLOR.replace(/[0-9a-f]{2}/g, (hex) => {
    const num = Number.parseInt(hex, 16)
    const darkened = Math.max(0, num - 40)
      .toString(16)
      .padStart(2, "0")
    return darkened
  })

  return (
    <div
      className="h-[220px] w-full rounded-sm cursor-pointer transition-all duration-300 hover:translate-y-[-5px] relative group overflow-hidden"
      style={{
        backgroundColor: darkenedColor,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05), 
                    inset 4px 0 0 0 ${book.accent}99,
                    2px 2px 4px rgba(0,0,0,0.5)`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=30')] opacity-20 mix-blend-overlay" />

      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      <div
        className="absolute right-0 top-0 h-full w-[3px] opacity-30"
        style={{
          background: `repeating-linear-gradient(0deg, 
            transparent, 
            transparent 20px, 
            rgba(0,0,0,0.2) 20px, 
            rgba(0,0,0,0.2) 40px)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 280' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='280' filter='url(%23noiseFilter)' opacity='1' fill='%23000000'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      <div className="h-full flex flex-col justify-between p-2 relative">
        <div
          className="writing-vertical-lr -rotate-180 text-center font-serif text-white/90 text-sm md:text-base font-medium tracking-wide absolute inset-0 flex items-center justify-center px-2 max-h-55 m-auto"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
        >
          <p className="flex-wrap">{book.title}</p>
        </div>

        <div className="writing-vertical-lr text-[10px] text-white/50 opacity-80 mt-auto ml-auto">
          {book.year}
        </div>

        <div
          className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full opacity-70"
          style={{ backgroundColor: book.accent }}
        />
      </div>

      <div className="absolute top-[10%] left-0 right-0 h-[1px] bg-black/20" />
      <div className="absolute bottom-[10%] left-0 right-0 h-[1px] bg-black/20" />

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          "bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        )}
      />
    </div>
  )
}
