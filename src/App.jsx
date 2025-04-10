import Bookshelf from "@/components/BookShelf"

export default function App() {
  return (
    <div className="relative">
      <div className="fixed inset-0 bg-[url(/background.webp)] bg-cover" />
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
      <main className="relative min-h-screen text-white z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-2 md:p-4">
          <header className="p-4 sm:p-0 sm:pt-2 text-center sm:mb-4">
            <h1 className="text-4xl md:text-5xl font-serif text-title sm:text-title/80 mb-2">
              The Atrio of Rowena
            </h1>
            <p className="text-description sm:text-description/70 text-lg italic">
              Collections of old magic books of four houses of the Atrio of
              Rowena
            </p>
          </header>
          <Bookshelf />
        </div>
      </main>
    </div>
  )
}
