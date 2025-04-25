import { cn } from '@/lib/utils'
// eslint-disable-next-line no-unused-vars
import { motion, stagger, useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'

/**
 * A React component that animates text with effects such as word replacement, blur, and opacity changes.
 *
 * @param {Object} props - The props for the component.
 * @param {string} [props.words=''] - The initial text to display, separated by spaces.
 * @param {string} [props.className] - Additional CSS classes to apply to the container.
 * @param {boolean} [props.filter=true] - Whether to apply a blur filter to the text during animation.
 * @param {number} [props.duration=0.5] - The duration of the animation in seconds.
 * @param {number|null} [props.activeIndex=null] - The index of the word to animate individually. If null, all words are animated.
 * @param {Object|null} [props.swapWord=null] - An object containing the word to swap and its index. Example: { word: 'newWord', index: 2 }.
 * @param {Array<Object>} [props.replacedWordInfo=[]] - An array of objects specifying words to replace. Each object should have the following properties:
 *   - {string} word - The replacement word.
 *   - {number} index - The starting index of the word to replace.
 *   - {number} length - The length of the word to replace.
 *
 * @returns {React.ReactElement} The rendered component with animated text effects.
 */
export function TextGenerateEffect({
  words = '',
  className,
  filter = true,
  duration = 0.5,
  activeIndex = null,
  swapWord = null,
  replacedWordInfo = []
}) {
  const [scope, animate] = useAnimate()
  const [currentWords, setCurrentWords] = useState(words.split(' '))

  useEffect(() => {
    if (swapWord && swapWord.index >= 0 && swapWord.index < currentWords.length) {
      setCurrentWords((prevWords) => {
        const newWords = [...prevWords]
        newWords[swapWord.index] = swapWord.word
        return newWords
      })
    }
  }, [swapWord])

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= 0 && activeIndex < currentWords.length) {
      animate(
        `span:nth-child(${activeIndex + 1})`,
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none'
        },
        { duration }
      )
    } else if (activeIndex === null) {
      animate(
        'span',
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none'
        },
        {
          duration,
          delay: stagger(0.2)
        }
      )
    }
  }, [activeIndex, currentWords])

  const renderWords = () => {
    const parts = []
    const originalWordsWithSpaces = []
    let tempWord = ''

    for (let i = 0; i < words.length; i++) {
      if (words[i] === ' ') {
        if (tempWord) {
          originalWordsWithSpaces.push({ type: 'word', value: tempWord })
          tempWord = ''
        }
        originalWordsWithSpaces.push({ type: 'space', value: ' ' })
      } else {
        tempWord += words[i]
      }
    }

    if (tempWord) {
      originalWordsWithSpaces.push({ type: 'word', value: tempWord })
    }

    let currentIndexInWords = 0

    originalWordsWithSpaces.forEach((item, idx) => {
      let isReplaced = false

      replacedWordInfo.forEach((replaced) => {
        if (item.type === 'word') {
          const wordStartIndex = words.indexOf(item.value, currentIndexInWords)

          if (
            wordStartIndex >= replaced.index &&
            wordStartIndex < replaced.index + replaced.length
          ) {
            parts.push(
              <motion.span
                key={`replaced-${replaced.index}`}
                className='replaced-word opacity-0'
                style={{ filter: filter ? 'blur(10px)' : 'none' }}
                aria-hidden='false'
              >
                {replaced.word}
              </motion.span>
            )

            if (
              idx < originalWordsWithSpaces.length - 1 &&
              originalWordsWithSpaces[idx + 1].type === 'space'
            ) {
              parts.push(
                <span key={`space-after-${replaced.index}`}>
                  {originalWordsWithSpaces[idx + 1].value}
                </span>
              )
            }

            isReplaced = true
          }
        }
      })

      if (!isReplaced) {
        parts.push(<span key={`${item.type}-${currentIndexInWords}`}>{item.value}</span>)
      }

      if (item.type === 'word') {
        currentIndexInWords += item.value.length
      } else if (item.type === 'space') {
        currentIndexInWords += item.value.length
      }
    })

    return <motion.div ref={scope}>{parts}</motion.div>
  }

  useEffect(() => {
    if (replacedWordInfo.length > 0) {
      setTimeout(() => {
        animate(
          '.replaced-word',
          { opacity: 1, filter: filter ? 'blur(0px)' : 'none' },
          { duration, delay: stagger(0.2) }
        )
      }, 50)
    }
  }, [replacedWordInfo, animate, duration, filter])

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
