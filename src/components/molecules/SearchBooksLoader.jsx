import { usePhraseCycle } from '@/hooks/usePhraseCycle'

/**
 * A loading indicator component that displays cycling phrases while searching for books.
 * @module SearchBooksLoader
 * @returns {React.ReactElement} A loading component with animated text phrases.
 */
export default function SearchBooksLoader() {
  /**
   * Array of loading phrases to cycle through
   * @type {string[]}
   */
  const loadingPhrases = [
    'Analyzing magical spells...',
    'Decodifying magic diagrams...',
    'Discovering magical entities...',
    'Casting high-level spells...',
    'Casting Wingardium Leviosa on magical books...'
  ]

  /**
   * Currently active phrase from the cycle
   * @type {string}
   */
  const phrases = usePhraseCycle(loadingPhrases)

  return (
    <div className='col-span-full w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm'>
      <p>We're searching for magical books, this may take a few spells...</p>
      <p>{phrases}</p>
    </div>
  )
}
