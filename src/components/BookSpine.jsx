import { useMemo } from "react"
import { useBookUnlock } from "../contexts/BookUnlock"

const hogwartsHouses = {
  Gryffindor: {
    url: "../../src/assets/logos/Gryffindor.webp",
    ColorClass: "book-color-gryffindor", // rojo oscuro
  },
  Slytherin: {
    url: "../../src/assets/logos/Slytherin.webp",
    ColorClass: "book-color-slytherin", // verde oscuro
  },
  Ravenclaw: {
    url: "../../src/assets/logos/Ravenclaw.webp",
    ColorClass: "book-color-Ravenclaw", // azul oscuro
  },
  Hufflepuff: {
    url: "../../src/assets/logos/Hufflepuff.webp",
    ColorClass: "book-color-hufflepuff", // amarillo dorado
  },
}

function extendBookWithHouseData(book, houses) {
  const houseData = houses[book.category_name] || {}
  return {
    ...book,
    ...houseData,
  }
}

export default function BookSpine({ book, onClick }) {
  const { booksUnlocked } = useBookUnlock()
  const isUnlocked = useMemo(
    () => booksUnlocked.some((unlockedBook) => unlockedBook.bookId === book.id),
    [booksUnlocked, book.id]
  )
  const extendBook = extendBookWithHouseData(book, hogwartsHouses)
  const spineStyle = useMemo(() => {
    return {
      backgroundColor: `color-mix(in srgb, var(--color-book) ${
        isUnlocked ? "85%" : "5%"
      }, black ${isUnlocked ? "5%" : "55%"})`,
      filter: isUnlocked ? "brightness(1)" : "brightness(0.5)",
    }
  }, [isUnlocked])

  return (
    <div
      className="h-[280px] w-full rounded-sm cursor-pointer duration-300 relative overflow-hidden book-spine"
      style={spineStyle}
      onClick={() => onClick(book.id)}
    >
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      <div className="absolute right-0 top-0 h-full w-[3px] opacity-30 bg-[repeating-linear-gradient(0deg,transparent_0_20px,rgba(0,0,0,0.2)_20px_40px)]" />
      <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('data:image/svg+xml;base64,...')]" />

      <div
        className={`h-full w-full flex flex-col items-center justify-between p-2 text-center relative ${extendBook.ColorClass}`}
      >
        <p className="flex-wrap p-1">{isUnlocked ? "🔓" : "🔒"}</p>
        <div className=" text-center font-serif text-white/90 text-sm md:text-base font-medium tracking-wide absolute inset-0 flex items-center justify-center px-2 max-h-55 m-auto [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
          <img
            src={extendBook.url}
            alt={extendBook.title}
            className="w-15"
          />
        </div>

        <div className="writing-vertical-lr text-[10px] text-white/50 opacity-80 mt-auto ml-auto"></div>

        <p className="flex-wrap text-xs">{book.title}</p>
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 size-4 rounded-full opacity-70"
          style={{ backgroundColor: book.accent }}
        />
      </div>

      <div className="absolute top-[10%] inset-x-0 h-px bg-black/20" />
      <div className="absolute bottom-[10%] inset-x-0 h-px bg-black/20" />

      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
