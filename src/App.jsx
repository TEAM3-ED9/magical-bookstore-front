import Bookshelf from "@/components/BookShelf"

export default function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] p-4 md:p-8 bg-[url(/public/background.webp)] bg-cover">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37]/80 mb-2">
            El Atrio de Rowena
          </h1>
          <p className="text-[#F0F0F0]/70 text-lg italic">
            Colección de libros mágicos antiguos de las cuatro casas
          </p>
        </header>
        <Bookshelf />
      </div>
    </main>
  )
}
