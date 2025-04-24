import { useState } from "react"

export default function BookSearch({ onSearch, onFilter, filter, search }) {
  const [loading, setLoading] = useState(false)
  const handleClearFilters = () => {
    setLoading(true)
    onSearch(null)
    onFilter("title")
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="mb-4 p-4 bg-shelf rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Search a book</h2>
      <div className="relative flex gap-3">
        {loading ? (
          <p className="w-full text-center text-4xl">
            Anapneo! Clearing old spells...
          </p>
        ) : (
          <>
            <select
              name="selector"
              className="w-32 py-2.5 rounded-xl px-5 bg-white/10 focus:bg-white/30 outline-0 border-none delay-75 transition-all duration-300 placeholder:text-white/50 hover:bg-white/30"
              onChange={(e) => {
                const value = e.target.value;
                onFilter(value);
              }}
              value={filter}
            >
              <option className="bg-shelf" value="title">
                Title
              </option>
              <option className="bg-shelf" value="author">
                Author
              </option>
            </select>
            <input
              type="text"
              className="w-full py-2.5 rounded-xl px-5 bg-white/10 focus:bg-white/30 outline-0 border-none delay-75 transition-all duration-300 placeholder:text-white/50 hover:bg-white/30"
              placeholder="Search by title or author..."
              value={search ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                onSearch(value);
              }}
            />
            <button
              className="absolute right-1.5 top-1.5 hover:bg-white/50 px-3 py-1 rounded-full cursor-pointer delay-75 transition-all duration-300"
              onClick={handleClearFilters}
            >
              X
            </button>
          </>
        )}
      </div>
    </div>
  );
}
