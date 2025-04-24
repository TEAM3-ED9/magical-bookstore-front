import { usePhraseCycle } from '@/hooks/usePhraseCycle'

/**
 * A full-screen error loader that displays when book fetching fails,
 * showing a dementor animation with cycling error messages.
 *
 * @example
 * // Basic usage
 * <ErrorLoader finalRetry={false} />
 *
 * // Final retry state
 * <ErrorLoader finalRetry={true} />
 *
 * @module ErrorLoader
 * @param {Object} props - Component props
 * @param {boolean} props.finalRetry - Whether this is the final retry attempt
 * @returns {React.ReactElement} A full-screen animated error loader component
 */
export default function ErrorLoader({ finalRetry }) {
  /**
   * Array of magical-themed error phrases that cycle automatically
   * @type {string[]}
   * @constant
   */
  const errorPhrases = [
    'Oh no! A dementor has attacked the library...',
    'Expecto Patronum! Containing the dementor...',
    'Reparo! Repairing magic vulnerabilities...',
    'Tempus Renovato! Recharging magical time...',
    'Anapneo! Clearing old spells...'
  ]

  /**
   * Currently active error phrase from the cycle
   * @type {string}
   * @see usePhraseCycle
   */
  const phrases = usePhraseCycle(errorPhrases)

  return (
    <div
      className='fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50'
      role='alert'
      aria-live='assertive'
      aria-busy='true'
    >
      <div className='relative'>
        {/* Animated dementor image with pulse effect */}
        <img
          src='/dementor.webp'
          alt='A dementor attacking the magical library'
          className='size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out'
          aria-hidden='true'
        />

        {/* Error message overlay */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-full text-lg bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm'>
            {!finalRetry
              ? phrases
              : "Oh no! A dementor has broken our spell... We can't find the books..."}
          </div>
        </div>
      </div>
    </div>
  )
}
