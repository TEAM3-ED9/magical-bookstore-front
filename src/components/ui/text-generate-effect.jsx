import { cn } from '@/lib/utils'
// eslint-disable-next-line no-unused-vars
import { motion, stagger, useAnimate } from 'motion/react'
import { useEffect } from 'react'

/**
 * A text animation component that sequentially reveals words with optional blur effect.
 * Creates a typewriter-like effect where words appear one after another.
 *
 * @example
 * // Basic usage
 * <TextGenerateEffect words="Magical text generation" />
 *
 * // With custom duration and no blur filter
 * <TextGenerateEffect
 *   words="Another magical sentence"
 *   duration={0.8}
 *   filter={false}
 *   className="text-xl"
 * />
 *
 * @module TextGenerateEffect
 * @param {Object} props - Component props
 * @param {string} props.words - The text to animate (will be split by spaces)
 * @param {string} [props.className] - Additional CSS classes for the container
 * @param {boolean} [props.filter=true] - Whether to apply blur filter during animation
 * @param {number} [props.duration=0.5] - Duration of each word's animation in seconds
 * @returns {React.ReactElement} An animated text generation component
 */
export const TextGenerateEffect = ({ words, className, filter = true, duration = 0.5 }) => {
  /**
   * Animation scope and controller from Framer Motion
   * @type {[React.RefObject, function]}
   * @see https://www.framer.com/motion/
   */
  const [scope, animate] = useAnimate()

  /**
   * The input words split into an array
   * @type {string[]}
   * @constant
   */
  let wordsArray = words.split(' ')

  /**
   * Animation effect that runs when component mounts or words change
   * @effect
   */
  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none'
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2)
      }
    )
  }, [scope.current])

  /**
   * Renders the animated words
   * @function renderWords
   * @returns {React.ReactElement} The animated words wrapped in motion components
   */
  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className='opacity-0'
              style={{
                filter: filter ? 'blur(10px)' : 'none'
              }}
              aria-hidden='false'
            >
              {word}{' '}
            </motion.span>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div
      className={cn('font-bold', className)}
      aria-live='polite'
    >
      <div className='mt-4'>
        <div className='leading-snug tracking-wide'>{renderWords()}</div>
      </div>
    </div>
  )
}
