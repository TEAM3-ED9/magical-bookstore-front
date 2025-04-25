import { usePhraseCycle } from '@/hooks/usePhraseCycle'

/**
 * A full-screen loading overlay with magical-themed animations and cycling phrases.
 * Displays a wand casting a spell with animated text phrases during loading states.
 *
 * @example
 * // Usage when making API requests or loading data
 * <RequestLoader />
 *
 * @module RequestLoader
 * @returns {React.ReactElement} A full-screen animated loading overlay component.
 */
export default function RequestLoader() {
  /**
   * Array of magical-themed loading phrases that cycle automatically
   * @type {string[]}
   * @constant
   */
  const loadingPhrases = [
    'Analyzing magical spells...',
    'Decodifying magic diagrams...',
    'Discovering magical entities...',
    'Casting high-level spells...',
    'Casting Wingardium Leviosa on magical books...',
    'Welcome young sorcerer...'
  ]

  /**
   * Currently active phrase from the cycle, managed by usePhraseCycle hook
   * @type {string}
   * @see usePhraseCycle
   */
  const phrases = usePhraseCycle(loadingPhrases)

  return (
    <div
      className='fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50'
      role='status'
      aria-live='polite'
      aria-busy='true'
    >
      <div className='relative'>
        {/* Animated wand image with pulse effect */}
        <img
          src='/loading.webp'
          alt='Image of a wand casting an spell'
          className='size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out'
          aria-hidden='true'
        />

        {/* Floating text overlay */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm'>
            {phrases}
          </div>
        </div>
      </div>
    </div>
  )
}
