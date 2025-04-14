import { useQueryState } from "nuqs"
import { useEffect } from "react"

export default function BookSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useQueryState("search")

  useEffect(() => {
    onSearch(searchTerm)
  }, [searchTerm])

  return (
    <div className="mb-4 p-4 bg-shelf rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Search a book</h2>
      <input
        type="text"
        className="w-full py-2.5 rounded-xl px-5 bg-white/10 focus:bg-white/30 outline-0 border-none delay-75 transition-all duration-300 placeholder:text-white/50 hover:bg-white/30"
        placeholder="Search by title or author..."
        value={searchTerm ?? ""}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
