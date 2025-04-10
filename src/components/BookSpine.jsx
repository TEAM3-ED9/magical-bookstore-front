export default function BookSpine({ book, onClick }) {
  return (
    <div
      className="h-[280px] w-full rounded-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden book-spine"
      style={{
        backgroundColor: `color-mix(in srgb, var(--color-book) ${
          book.status === 0 ? "85%" : "5%"
        }, black 55%)`,
      }}
      onClick={() => onClick(book.id)}
    >
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      <div className="absolute right-0 top-0 h-full w-[3px] opacity-30 bg-[repeating-linear-gradient(0deg,transparent_0_20px,rgba(0,0,0,0.2)_20px_40px)]" />
      <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('data:image/svg+xml;base64,...')]" />

      <div className="h-full flex flex-col justify-between p-2 relative">
        <div className="writing-vertical-lr -rotate-180 text-center font-serif text-white/90 text-sm md:text-base font-medium tracking-wide absolute inset-0 flex items-center justify-center px-2 max-h-55 m-auto [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">
          <p className="flex-wrap">{book.title}</p>
        </div>

        <div className="writing-vertical-lr text-[10px] text-white/50 opacity-80 mt-auto ml-auto">
          {book.year}
        </div>

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
