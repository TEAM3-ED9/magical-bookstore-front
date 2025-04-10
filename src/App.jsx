import Bookshelf from "@/components/BookShelf";

export default function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] bg-[url(/public/background.webp)] bg-cover text-white h-screen overflow-x-hidden">
      <div className=" w-full h-full inset-0 bg-black/30 backdrop-blur-sm z-50">
        <div className="max-w-7xl h-full mx-auto">
          <header className="p-6 sm:p-0 sm:pt-8 text-center sm:mb-6">
            <h1 className="text-4xl md:text-5xl font-serif text-title sm:text-title/80 mb-2">
              The Atrio of Rowena
            </h1>
            <p className="text-description sm:text-description/70 text-lg italic">
              Colections of old magic books of four house of the Atrio of Rowena
            </p>
          </header>
          <Bookshelf />
        </div>
      </div>
    </main>
  );
}
