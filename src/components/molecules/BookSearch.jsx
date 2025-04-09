import { useQueryState } from "nuqs"
import { useEffect } from "react"

export default function BookSearch({ setSearch }) {
  const [searchTerm, setSearchTerm] = useQueryState("search")

  useEffect(() => {
    setSearch(searchTerm)
  }, [searchTerm])

  return (
    <div className="mb-4 p-4 bg-shelf rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Search a book</h2>
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Search by title or author..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
