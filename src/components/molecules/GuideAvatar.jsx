import { MESSAGE_DURATION_MS } from '@/lib/constants'
import { useEffect, useState } from 'react'

/**
 * Array of magical guidance messages that cycle automatically
 * @type {string[]}
 * @constant
 */
const messages = [
  'Young wizard, the secrets of the books await your wit!',
  'Remember, magic requires precision—answer wisely!',
  "The library's enchantments are strict. Proceed with care.",
  'Some books hold ancient spells; others guard dark knowledge.',
  'The books reset when you leave the library—your progress vanishes!',
  'A warning: Three wrong answers lock a book indefinitely.',
  "The Sorting Hat couldn't have chosen better for this challenge!",
  'Only the cleverest witches and wizards unlock these tomes.',
  'The Atrio of Rowena tests your courage and intellect!',
  'Proceed, but tread carefully—mistakes are costly.'
]

/**
 * Array of help messages that appear when clicking the avatar
 * @type {string[]}
 * @constant
 */
const helpMessages = [
  'Click on a book to see its details.',
  'Answer the riddle correctly to unlock a book.',
  'Too many wrong answers will lock the book permanently.',
  'Search by title or author using the search bar.',
  'Leaving the library resets all progress.'
]

/**
 * An interactive guide avatar that provides magical guidance and help messages.
 * Displays Rowena Ravenclaw's portrait with cycling messages and clickable help.
 *
 * @example
 * // Usage with dynamic messages
 * <GuideAvatar message={errorMessage} />
 *
 * @module GuideAvatar
 * @param {Object} props - Component props
 * @param {string} [props.message] - Optional dynamic message to display (e.g., errors)
 * @returns {React.ReactElement} An interactive guide avatar component
 */
export default function GuideAvatar({ message }) {
  /**
   * Current displayed message
   * @type {[string, Function]}
   */
  const [comment, setComment] = useState(
    'Ah, young wizard, let me prepare myself to answer your questions...'
  )

  /**
   * Controls visibility of the message bubble
   * @type {[boolean, Function]}
   */
  const [isVisible, setIsVisible] = useState(true)

  /**
   * Index for cycling through normal messages
   * @type {[number, Function]}
   */
  const [messageIndex, setMessageIndex] = useState(-1)

  /**
   * Flag indicating when last normal message was shown
   * @type {[boolean, Function]}
   */
  const [lastMessage, setLastMessage] = useState(false)

  /**
   * Index for cycling through help messages
   * @type {[number, Function]}
   */
  const [helpMessageIndex, setHelpMessageIndex] = useState(0)

  /**
   * Handles avatar clicks to cycle through help messages
   * @function handleHelpClick
   */
  const handleHelpClick = () => {
    setIsVisible(true)
    const newIndex = (helpMessageIndex + 1) % helpMessages.length
    setHelpMessageIndex(newIndex)
    setComment(helpMessages[newIndex])
    setTimeout(() => setIsVisible(false), MESSAGE_DURATION_MS)
  }

  // Initial welcome message effect
  useEffect(() => {
    setIsVisible(true)
    setComment(
      'Welcome to the Atrio of Rowena! Some books are locked until you answer correctly. Be cautious—too many wrong answers will lock them permanently for a while.'
    )
    const timer = setTimeout(() => setMessageIndex(0), MESSAGE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  // Dynamic message effect (for prop changes)
  useEffect(() => {
    if (message) {
      setIsVisible(true)
      setComment(message)
      const timer = setTimeout(() => setIsVisible(false), MESSAGE_DURATION_MS)
      return () => clearTimeout(timer)
    }
    if (message === '') {
      setIsVisible(false)
    }
  }, [message])

  // Normal message cycling effect
  useEffect(() => {
    if (!lastMessage && messageIndex >= 0) {
      const timer = setTimeout(() => {
        setMessageIndex((prevIndex) => {
          const newIndex = prevIndex + 1
          setComment(messages[newIndex])
          if (newIndex === messages.length - 1) {
            setLastMessage(true)
            setTimeout(() => setIsVisible(false), MESSAGE_DURATION_MS)
          }
          return newIndex
        })
      }, MESSAGE_DURATION_MS)
      return () => clearTimeout(timer)
    }
  }, [messageIndex, lastMessage, messages.length])

  // Search tip effect (after normal messages)
  useEffect(() => {
    const showTimer = setTimeout(
      () => {
        setIsVisible(true)
        setComment('You can search books by title or author...')
      },
      MESSAGE_DURATION_MS + messages.length * MESSAGE_DURATION_MS
    )
    const hideTimer = setTimeout(
      () => setIsVisible(false),
      MESSAGE_DURATION_MS + messages.length * MESSAGE_DURATION_MS
    )
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [messages.length])

  return (
    <article
      className='fixed bottom-5 left-5 z-20'
      role='complementary'
      aria-label='Magical guide'
    >
      <div
        className='relative cursor-pointer'
        onClick={handleHelpClick}
        aria-haspopup='true'
        aria-expanded={isVisible}
      >
        {/* Avatar images */}
        <div className='relative size-20 sm:size-32'>
          <img
            src='/frame.webp'
            alt='Ornate picture frame'
            className='size-20 sm:size-32 absolute'
            aria-hidden='true'
          />
          <img
            src='/rowena.webp'
            alt='Portrait of Rowena Ravenclaw'
            className='size-12 sm:size-20 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full'
          />
        </div>

        {/* Message bubbles */}
        {(message || (!message && isVisible)) && (
          <div
            className='absolute left-24 sm:left-36 top-1/2 -translate-y-1/2 rounded-lg text-yellow-400'
            role='alert'
            aria-live='polite'
          >
            <div className='relative'>
              <span className='inline-block py-3 px-5 text-lg bg-black rounded-lg shadow-md min-w-68 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg'>
                {comment}
              </span>
              <div className='absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-black'></div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
