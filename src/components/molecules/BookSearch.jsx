import { useState } from 'react'

/**
 * A search component for filtering books by title or author with magical styling.
 * Includes a filter selector, search input, and clear filters functionality.
 *
 * @example
 * // Basic usage
 * <BookSearch
 *   onSearch={(value) => handleSearch(value)}
 *   onFilter={(type) => setFilterType(type)}
 *   filter={currentFilter}
 *   search={currentSearchTerm}
 * />
 *
 * @module BookSearch
 * @param {Object} props - Component props
 * @param {function(string|null): void} props.onSearch - Callback when search term changes (null clears search)
 * @param {function('title'|'author'): void} props.onFilter - Callback when filter type changes
 * @param {'title'|'author'} props.filter - Current active filter type
 * @param {string|null} [props.search] - Current search term (null or undefined clears input)
 * @returns {React.ReactElement} A magical book search component with filter options
 */
export default function BookSearch({ onSearch, onFilter, filter, search }) {
  /**
   * Loading state during filter clearing animation
   * @type {[boolean, Function]}
   */
  const [loading, setLoading] = useState(false)

  /**
   * Clears all search filters and resets to default state
   * @function handleClearFilters
   */
  const handleClearFilters = () => {
    setLoading(true)
    onSearch(null)
    onFilter('title')
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  /**
   * Handles filter type changes with type safety
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleFilterChange = (e) => {
    const value = e.target.value
    // Type guard to ensure only valid filter values are passed
    if (value === 'title' || value === 'author') {
      onFilter(value)
    }
  }

  return (
    <div
      className='mb-4 p-4 bg-shelf rounded-lg shadow-xl'
      role='search'
      aria-label='Book search'
    >
      <h2 className='text-2xl font-bold mb-4'>Search a book</h2>
      <div className='relative flex gap-3'>
        {loading ? (
          <p
            className='w-full text-center text-4xl'
            aria-live='polite'
          >
            Anapneo! Clearing old spells...
          </p>
        ) : (
          <>
            {/* Filter type selector */}
            <select
              name='selector'
              className='w-32 py-2.5 rounded-xl px-5 bg-white/10 focus:bg-white/30 outline-0 border-none delay-75 transition-all duration-300 placeholder:text-white/50 hover:bg-white/30'
              onChange={handleFilterChange}
              value={filter}
              aria-label='Search filter type'
            >
              <option
                className='bg-shelf'
                value='title'
              >
                Title
              </option>
              <option
                className='bg-shelf'
                value='author'
              >
                Author
              </option>
            </select>

            {/* Search input field */}
            <input
              type='text'
              className='w-full py-2.5 rounded-xl px-5 bg-white/10 focus:bg-white/30 outline-0 border-none delay-75 transition-all duration-300 placeholder:text-white/50 hover:bg-white/30'
              placeholder='Search by title or author...'
              value={search ?? ''}
              onChange={(e) => {
                const value = e.target.value
                onSearch(value)
              }}
              aria-label='Search books'
            />

            {/* Clear filters button */}
            <button
              className='absolute right-1.5 top-1.5 hover:bg-white/50 px-3 py-1 rounded-full cursor-pointer delay-75 transition-all duration-300'
              onClick={handleClearFilters}
              aria-label='Clear search filters'
            >
              X
            </button>
          </>
        )}
      </div>
    </div>
  )
}
