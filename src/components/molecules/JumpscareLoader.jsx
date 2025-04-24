import { useCallback } from 'react'

/**
 * A dramatic "jumpscare" style loader that appears when book unlocking fails,
 * showing a dementor image with an option to try again.
 *
 * @example
 * // Usage when book unlocking fails
 * <JumpscareLoader onButtonClick={(shouldRetry) => handleRetry(shouldRetry)} />
 *
 * @module JumpscareLoader
 * @param {Object} props - Component props
 * @param {function(boolean): void} props.onButtonClick - Callback invoked when the retry button is clicked
 * @returns {React.ReactElement} A full-screen animated jumpscare loader component
 */
export default function JumpscareLoader({ onButtonClick }) {
  /**
   * Handles the retry button click event
   * @type {function(): void}
   * @callback
   */
  const handleButtonClick = useCallback(() => {
    onButtonClick(false)
  }, [onButtonClick])

  return (
    <div
      className='fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50'
      role='alert'
      aria-live='assertive'
    >
      <div className='relative'>
        {/* Animated dementor image with pulse effect */}
        <img
          src='/dementor.webp'
          alt='A terrifying dementor guarding the book'
          className='size-120 object-contain rounded-lg shadow-xl animate-pulse duration-900 delay-900 ease-in-out'
          aria-hidden='true'
        />

        {/* Warning message overlay */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-full text-xl bg-black/70 text-center font-bold text-white mt-8 p-4 backdrop-blur-sm'>
            <p>It seems a dementor is guarding this book...</p>
            <p>Maybe the unlocking spell was wrong?</p>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={handleButtonClick}
          className='mt-4 absolute left-1/2 -translate-x-1/2 px-8 py-2 bg-dark/70 text-white font-bold text-2xl rounded-lg cursor-pointer'
          aria-label='Try another unlocking spell'
        >
          Try Another Spell
        </button>
      </div>
    </div>
  )
}
