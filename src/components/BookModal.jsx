import { CardContainer } from '@/components/ui/3d-card'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { useBookUnlock } from '@/contexts/BookUnlock'
import { API_ENDPOINTS, MESSAGE_DURATION_MS, SWR_OPTIONS } from '@/lib/constants'
import { fetcher, formatTime, getBookSize, useCustomMutation } from '@/lib/utils'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { TextGenerateEffectOriginal } from './ui/text-original'

/**
 * BookModal component displays a modal with a book's details and interactive features.
 * It allows users to unlock books by answering riddles, view secret content, and handle cooldowns.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Indicates whether the modal is open.
 * @param {function(React.MouseEvent<HTMLDivElement> | void): void} props.onClose - Callback function to close the modal.
 * @param {Function} props.onMaxFailedAttempts - Callback function triggered after maximum failed attempts.
 * @param {Function} props.onSendMessage - Callback function to send messages to the user.
 * @param {Object} props.book - The book object containing its details.
 * @param {string} props.book.id - The unique identifier of the book.
 * @param {string} props.book.title - The title of the book.
 * @param {string} props.book.author - The author of the book.
 * @param {string} props.book.description - The description of the book, which may contain secrets.
 * @param {number} props.book.status - The status of the book (e.g., locked or unlocked).
 *
 /**
 * @component BookModal
 * @description A modal component that displays a book with animated page transitions.
 * It handles different states such as locked, unlocked, and cooldown periods,
 * displaying appropriate content and interactions for each state.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {object} props.book - The data object containing information about the book.
 * @param {boolean} props.isUnlocked - Indicates if the current book is unlocked.
 * @param {boolean} props.isInCooldown - Indicates if the user is in a cooldown period.
 * @param {string} props.remainingTime - The remaining time in the cooldown period.
 * @param {boolean} props.isLoading - Indicates if data is currently being loaded.
 * @param {object} props.questionData - The data for the current riddle question.
 * @param {string} props.userAnswer - The user's current answer to the riddle.
 * @param {function} props.setUserAnswer - Function to update the user's answer.
 * @param {boolean} props.answerIncorrect - Indicates if the user's last answer was incorrect.
 * @param {number} props.retryCount - The number of incorrect attempts made.
 * @param {function} props.checkAnswer - Function to validate the user's answer.
 * @param {string} props.buttonText - The text displayed on the submit button.
 * @param {string} props.unlockedDescription - The description to display when the book is unlocked.
 * @param {number} props.animationPhase - The current phase of the unlock animation.
 * @param {string} props.bookDescription - The currently displayed description of the book.
 * @param {Array<object>} props.replacedWords - Information about words replaced during secret reveal.
 * @param {boolean} props.animationComplete - Indicates if the secret reveal animation is complete.
 * @param {function} props.handleSecretClick - Function to handle the click on the secret reveal trigger.
 * @param {object} props.secretsData - Data containing secret words to reveal.
 * @param {function} props.setReplacedWords - Function to set the replaced words state.
 * @param {function} props.setBookDescription - Function to set the book description state.
 * @param {function} props.storeBookDescription - Function to store the updated book description.
 *
 * @returns {React.ReactElement} The rendered BookModal component.
 */
export default function BookModal({ isOpen, onClose, onMaxFailedAttempts, onSendMessage, book }) {
  /**
   * */

  /** @type {[boolean, function]} */
  const [animationComplete, setAnimationComplete] = useState(false)

  /** @type {[Array<string>, function]} */
  const [replacedWords, setReplacedWords] = useState([])

  /** @type {[boolean, function]} */
  const [showSecret, setShowSecret] = useState(false)

  /** @type {[string, function]} */
  const [remainingTime, setRemainingTime] = useState('')

  /** @type {[Object|null, function]} */
  const [questionData, setQuestionData] = useState(null)

  /** @type {[string, function]} */
  const [userAnswer, setUserAnswer] = useState('')

  /** @type {[boolean, function]} */
  const [answerIncorrect, setAnswerIncorrect] = useState(false)

  /** @type {[string, function]} */
  const [buttonText, setButtonText] = useState('Summon the Owl')

  /** @type {[string, function]} */
  const [bookDescription, setBookDescription] = useState('')

  /** @type {[number, function]} */
  const [animationPhase, setAnimationPhase] = useState(0)

  /** @type {[boolean, function]} */
  const [hasUnlockedSecrets, setHasUnlockedSecrets] = useState(false)

  /**
   * Regular expression to match secret patterns in book descriptions (one or more '#' characters).
   * Used to identify hidden content markers in text.
   * @type {RegExp}
   */
  const secretPatternRegex = /#+/g

  /**
   * The result of matching the secret pattern against the current book's description.
   * Contains an array of matches if found, or null if no matches exist.
   * @type {Array<string>|null}
   */
  const secretMatches = book.description.match(secretPatternRegex)

  /**
   * Flag indicating whether the current book contains any secret patterns.
   * True when secretMatches is not null and contains at least one match.
   * @type {boolean}
   */
  const hasSecrets = secretMatches !== null && secretMatches.length > 0

  /**
   * Destructured values from the useBookUnlock hook for managing book unlocking state.
   * @type {{
   *   booksUnlocked: Array<{
   *     bookId: string,
   *     unlockTime: number,
   *     timerId: number|null,
   *     description?: string
   *   }>,
   *   retryCounts: Record<string, number>,
   *   cooldownEndTimes: Record<string, number>,
   *   unlockBook: (bookId: string, description?: string) => void,
   *   incrementRetryCount: (bookId: string) => void,
   *   storeBookDescription: (bookId: string, description: string) => void
   * }}
   */
  const {
    booksUnlocked,
    retryCounts,
    cooldownEndTimes,
    unlockBook,
    incrementRetryCount,
    storeBookDescription
  } = useBookUnlock()

  /**
   * Memoized function that returns the appropriate book description based on unlock status.
   * Returns the full description if book is public (status 0), otherwise checks unlocked books.
   * @type {string|undefined}
   */
  const unlockedDescription = useMemo(() => {
    if (book.status === 0) {
      return book.description
    } else {
      return booksUnlocked?.find((b) => b.bookId === book?.id)?.description
    }
  }, [booksUnlocked, book?.id, book.status, book.description])

  /**
   * Memoized boolean indicating whether the current book is unlocked.
   * @type {boolean}
   */
  const isUnlocked = useMemo(
    () => booksUnlocked.some((b) => b.bookId === book?.id),
    [booksUnlocked, book?.id]
  )

  /**
   * Memoized count of retry attempts for the current book.
   * Returns 0 if no retries recorded.
   * @type {number}
   */
  const retryCount = useMemo(() => retryCounts[book?.id] || 0, [retryCounts, book?.id])

  /**
   * Memoized cooldown end timestamp for the current book.
   * Returns null if no cooldown active.
   * @type {number|null}
   */
  const cooldownEndTime = useMemo(
    () => cooldownEndTimes[book?.id] || null,
    [cooldownEndTimes, book?.id]
  )

  /**
   * Memoized boolean indicating if book is in cooldown period.
   * True when retry count >= 3 and cooldown hasn't expired.
   * @type {boolean}
   */
  const isInCooldown = useMemo(
    () => retryCount >= 3 && cooldownEndTime && cooldownEndTime > Date.now(),
    [retryCount, cooldownEndTime]
  )

  /**
   * Memoized API endpoint for fetching book question.
   * Returns null if book is unlocked, in cooldown, or not question-protected.
   * @type {string|null}
   */
  const questionQuery = useMemo(
    () =>
      book?.status === 1 && !isUnlocked && !isInCooldown
        ? API_ENDPOINTS.GET_QUESTION + book.id
        : null,
    [book, isUnlocked, isInCooldown]
  )

  /**
   * Handler function for revealing secret content.
   * Sets the showSecret state to true when called.
   * @type {function(): void}
   */
  const handleSecretClick = () => {
    setShowSecret(true)
  }

  /**
   * URL for fetching secret words, constructed when both:
   * 1. Book has secrets (hasSecrets is true)
   * 2. User has clicked to reveal them (showSecret is true)
   * @type {string|null}
   */
  const secretsUrl =
    hasSecrets && showSecret ? `${API_ENDPOINTS.SECRET_WORDS}/book_id?book_id=${book.id}` : null

  /**
   * SWR hook for fetching secret words data from the API.
   * @type {Object}
   * @property {Array<{original: string, replacement: string}>|undefined} data - The fetched secrets data containing original and replacement words
   */
  const { data: secretsData } = useSWR(secretsUrl, fetcher, { ...SWR_OPTIONS })

  /**
   * Animates the replacement of secret words in the book description.
   * Handles the sequential animation of words being replaced.
   *
   * @type {function(Array<string>): void}
   * @param {Array<string>} replacedWords - Array of replacement words
   * @returns {void}
   */
  const animateSecretWords = useCallback((replacedWords) => {
    if (!replacedWords?.length) return

    setAnimationComplete(false)

    let currentIndex = 0
    const totalWords = replacedWords.length

    const animateNextWord = () => {
      if (currentIndex >= totalWords) {
        setAnimationComplete(true)
        return
      }

      currentIndex++
      setTimeout(animateNextWord, 300)
    }

    animateNextWord()
  }, [])

  /**
   * Effect hook that triggers the secret words animation when replacedWords changes.
   * Only runs when there are words to replace.
   */
  useEffect(() => {
    if (replacedWords.length > 0) {
      animateSecretWords(replacedWords)
    }
  }, [replacedWords, animateSecretWords])

  /**
   * Effect hook that triggers secret words animation when secrets data is loaded.
   * Only runs when secretsData contains valid words array.
   */
  useEffect(() => {
    if (secretsData && secretsData?.words) {
      animateSecretWords(secretsData?.words)
    }
  }, [secretsData, animateSecretWords])

  /**
   * SWR hook for fetching book question data with custom options.
   * @type {Object}
   * @property {boolean} isLoading - Loading state of the question request
   */
  const { isLoading } = useSWR(questionQuery, fetcher, {
    ...SWR_OPTIONS,
    revalidateOnFocus: false,
    onSuccess: (data) => {
      setQuestionData(data)
      setUserAnswer('')
      setAnswerIncorrect(false)
    },
    onError: () => {
      if (questionQuery) {
        setQuestionData({ question: 'Failed to load question.', answer: '' })
      } else {
        setQuestionData(null)
      }
    }
  })

  /**
   * Effect hook that manages the cooldown timer display.
   * Updates remaining time every second when in cooldown.
   * Cleans up interval on unmount or when cooldown ends.
   */
  useEffect(() => {
    /** @type {NodeJS.Timeout|null} */
    let timerInterval = null

    if (isInCooldown && cooldownEndTime) {
      const updateTimer = () => {
        const now = Date.now()
        const msLeft = cooldownEndTime - now

        if (msLeft <= 0) {
          setRemainingTime('00:00')
          clearInterval(timerInterval)
        } else {
          setRemainingTime(formatTime(msLeft))
        }
      }

      updateTimer()
      timerInterval = setInterval(updateTimer, 1000)
    } else {
      setRemainingTime('')
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [isInCooldown, cooldownEndTime, book?.id])

  /**
   * Custom mutation hook for validating question answers.
   * @type {Object}
   * @property {function} trigger - Function to execute the mutation
   */
  const { trigger } = useCustomMutation(API_ENDPOINTS.VALIDATE_QUESTION, {
    fetcher,
    method: 'POST'
  })

  /**
   * @async
   * @function checkAnswer
   * @description Checks the user's answer against the expected answer for the current question.
   * If the answer is correct, it unlocks the book, triggers an animation, and potentially reveals secrets.
   * If the answer is incorrect, it manages retry attempts and provides feedback to the user.
   *
   * @returns {void}
   */
  const checkAnswer = useCallback(async () => {
    const answer = userAnswer.trim()
    if (!answer || !questionData?.id || !book?.id || isUnlocked || isInCooldown) return

    const normalizedUserAnswer = answer.charAt(0).toUpperCase() + answer.slice(1)

    try {
      const data = await trigger({
        body: JSON.stringify({
          question_id: questionData.id,
          book_id: book.id,
          answer: normalizedUserAnswer
        })
      })

      if (data?.message?.includes('Book unlocked successfully')) {
        unlockBook(book.id, book.description)
        setAnimationPhase(1)
        setBookDescription(book.description)
        setHasUnlockedSecrets(hasSecrets)
        onSendMessage('')
      }
    } catch (error) {
      console.error('Error validating answer:', error)

      const currentRetryCount = retryCounts[book.id] || 0
      incrementRetryCount(book.id)
      setAnswerIncorrect(true)

      if (currentRetryCount + 1 === 1) {
        onSendMessage("Be careful! That's your first wrong answer.")
        setTimeout(() => {
          onSendMessage('')
        }, MESSAGE_DURATION_MS)
      } else if (currentRetryCount + 1 === 2) {
        onSendMessage('Careful now—only one more try before this book locks!')
        setTimeout(() => {
          onSendMessage('')
        }, MESSAGE_DURATION_MS)
      }

      if (currentRetryCount + 1 >= 3) {
        onSendMessage('We must clear all this messy library...')
        onMaxFailedAttempts()
        onClose()
      }
    }
  }, [
    userAnswer,
    questionData,
    book?.id,
    trigger,
    unlockBook,
    incrementRetryCount,
    retryCounts,
    onMaxFailedAttempts,
    isUnlocked,
    isInCooldown,
    onSendMessage,
    hasSecrets,
    setHasUnlockedSecrets
  ])

  /**
   * @useEffect
   * @description Sets a timeout to reset the animation phase after a delay if no secrets are involved.
   * Clears the timeout if the component unmounts or the dependencies change.
   *
   * @dependency {number} animationPhase - The current phase of the animation.
   * @dependency {boolean} hasUnlockedSecrets - A boolean indicating if secrets have been unlocked.
   */
  useEffect(() => {
    if (animationPhase === 1) {
      const timer = setTimeout(() => {
        if (!hasUnlockedSecrets) {
          setAnimationPhase(0)
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [animationPhase, hasUnlockedSecrets])

  /**
   * @useEffect
   * @description Updates the displayed book description when the list of unlocked books changes.
   *
   * @dependency {string} unlockedDescription - The description of the currently focused book.
   * @dependency {Array<string>} booksUnlocked - An array containing the IDs of the unlocked books.
   */
  useEffect(() => {
    setBookDescription(unlockedDescription)
  }, [booksUnlocked])

  /**
   * @useEffect
   * @description When the animation phase is 2 and secret words are available, this effect prepares the book description
   * by replacing placeholders with the secret words. It then sets a timeout to display the processed description
   * and triggers the animation of the secret words. Clears the timeout on unmount or dependency change.
   *
   * @dependency {number} animationPhase - The current phase of the animation.
   * @dependency {object} secretsData - An object containing the secret words (if available).
   * @dependency {string} book.description - The original description of the book.
   * @dependency {function} animateSecretWords - A function to animate the revealed secret words.
   */
  useEffect(() => {
    if (animationPhase === 2 && secretsData?.words) {
      const result = prepareDescription(book.description, secretsData.words)
      setReplacedWords(result.replacedWordInfo)

      const timer = setTimeout(() => {
        setBookDescription(result.processedDescription)
      }, MESSAGE_DURATION_MS)

      animateSecretWords(result.replacedWordInfo)

      return () => clearTimeout(timer)
    }
  }, [animationPhase, secretsData, book.description, animateSecretWords])

  /**
   * @useEffect
   * @description Triggered when `showSecret` becomes true and secret words are available. It prepares and displays
   * the book description with the secrets, sets the animation phase to 2, stores the updated description,
   * and initiates the animation of the secret words.
   *
   * @dependency {boolean} showSecret - A boolean indicating whether to show the secret words.
   * @dependency {object} secretsData - An object containing the secret words (if available).
   * @dependency {string} book.description - The original description of the book.
   * @dependency {function} animateSecretWords - A function to animate the revealed secret words.
   */
  useEffect(() => {
    if (showSecret && secretsData?.words) {
      const result = prepareDescription(book.description, secretsData.words)
      setReplacedWords(result.replacedWordInfo)
      setBookDescription(result.processedDescription)
      setAnimationPhase(2)
      storeBookDescription(book.id, bookDescription)

      animateSecretWords(result.replacedWordInfo)
    }
  }, [showSecret, secretsData, book.description, animateSecretWords])

  /**
   * @useEffect
   * @description Manages the initial message displayed when the modal opens for a locked and non-cooldown book.
   * If the book has a status of 1, it prompts the user to answer a riddle. It also randomly sets the text
   * for a button (presumably the submit button).
   *
   * @dependency {boolean} isOpen - Indicates whether the modal is currently open.
   * @dependency {boolean} isUnlocked - Indicates whether the current book is unlocked.
   * @dependency {boolean} isInCooldown - Indicates whether the user is currently in a cooldown period.
   * @dependency {function} onSendMessage - A function to send messages to the user interface.
   * @dependency {number} book?.status - The status of the current book.
   */
  useEffect(() => {
    if (isOpen && !isUnlocked && !isInCooldown) {
      if (book.status === 1) {
        onSendMessage("Answer the riddle correctly to unlock this book's secrets!")

        setTimeout(() => {
          onSendMessage('')
        }, MESSAGE_DURATION_MS)
      }

      const texts = ['Summon the Owl', 'Send the Owl', 'Dispatch the Owl']
      setButtonText(texts[Math.floor(Math.random() * 3)])
    }
  }, [isOpen, isUnlocked, isInCooldown, onSendMessage, book?.status])

  /**
   * @function restrictedContent
   * @description Renders different UI components based on the current state of the book interaction,
   * such as cooldown period, loading state, locked state requiring a riddle, or no restricted content.
   *
   * @returns {JSX.Element | null} - Returns JSX elements to display appropriate content based on the state,
   * or null if no restricted content is needed (e.g., the book is unlocked).
   */
  const restrictedContent = useMemo(() => {
    if (isInCooldown) {
      return (
        <div className='flex flex-col items-center justify-center text-center gap-4 p-4'>
          <p className='font-magic text-lg text-red-700'>Too many failed attempts!</p>
          <p className='font-serif text-md text-amber-900'>
            The magic protecting this book needs time to settle. Please wait:
          </p>
          <p
            className='font-mono text-4xl font-bold text-emerald-900 tracking-wider'
            aria-live='polite'
          >
            {remainingTime}
          </p>
          <p className='font-serif text-sm text-gray-600'>
            (You can close this book while waiting)
          </p>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className='flex flex-col items-center justify-center text-center'>
          <img
            src='/wand-loader.gif'
            alt='Wand Loader'
            className='w-60 h-32 mb-4'
          />
          <p className='font-magic text-md text-amber-800'>
            The Pensieve is searching for a question...
          </p>
        </div>
      )
    }

    if (!isUnlocked && !isInCooldown) {
      return (
        <div className='flex flex-col gap-4'>
          <p className='text-amber-800 font-magic text-md'>
            This tome is enchanted! You must answer a riddle before its secrets are revealed...
          </p>
          <p className='font-serif font-semibold text-emerald-900'>
            {questionData?.question || 'Loading riddle...'}{' '}
          </p>
          <input
            type='text'
            className='border border-amber-700 p-2 rounded bg-amber-100 text-emerald-900 font-serif'
            placeholder='Your answer...'
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                checkAnswer()
              }
            }}
            aria-label='Your answer'
          />
          {answerIncorrect && (
            <p
              className='text-red-600 text-sm -mt-3'
              role='alert'
            >
              {retryCount === 1
                ? 'Your first attempt was incorrect. Try again!'
                : retryCount === 2
                  ? 'Still not quite right. Think carefully!'
                  : 'Alas, your answer is incorrect.'}{' '}
            </p>
          )}
          <button
            onClick={checkAnswer}
            className='bg-emerald-800 text-white font-magic px-4 py-2 rounded hover:bg-emerald-700 transition'
            aria-label='Send Owl'
            disabled={!questionData?.question}
          >
            {buttonText}
          </button>
        </div>
      )
    }

    return null
  }, [
    isInCooldown,
    remainingTime,
    isLoading,
    isUnlocked,
    questionData,
    userAnswer,
    answerIncorrect,
    retryCount,
    checkAnswer,
    buttonText
  ])

  /**
   * @constant bookContent
   * @description An array containing the content for the book's pages. It dynamically determines the right page's
   * title and content based on the book's status (cooldown, restricted, or showing description).
   *
   * @returns {Array<Object>} - An array with a single object representing the book's two pages.
   * Each page object has a `leftPage` and a `rightPage` property, containing the title, content, and index.
   */
  const bookContent = useMemo(
    () => [
      {
        leftPage: {
          title: book?.title ?? '',
          content: `By ${book?.author ?? ''}`,
          index: 1
        },
        rightPage: {
          title: isInCooldown
            ? 'Cooldown Active'
            : book?.status === 1 && !isUnlocked
              ? 'Restricted Section'
              : 'Description',
          content:
            book?.status === 1 && !isUnlocked
              ? restrictedContent
              : bookDescription || (book?.description ?? ''),
          index: 2
        }
      }
    ],
    [book, restrictedContent, isInCooldown, isUnlocked]
  )

  /**
   * @useEffect
   * @description Adds an event listener to the window to handle the 'Escape' key press. When pressed,
   * it calls the `onClose` function to close the modal. It also removes the event listener when the
   * component unmounts or when the `isOpen` or `onClose` dependencies change.
   *
   * @dependency {boolean} isOpen - Indicates whether the modal is currently open.
   * @dependency {function} onClose - A function to close the modal.
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  /**
   * @constant bookSize
   * @description Memoizes the result of the `getBookSize` function, which likely determines the dimensions
   * or other size-related properties of the book component. This ensures that `getBookSize` is only
   * recalculated when its internal dependencies change (though none are explicitly listed here, it likely
   * depends on window size or other layout-related states within the component or its context).
   */
  const bookSize = useMemo(() => getBookSize(), [])

  /**
   * @function prepareDescription
   * @description Replaces sequences of '#' characters in a given description with provided words.
   * It identifies the '#' patterns, and if the number of patterns matches the number of words,
   * it substitutes each pattern with a corresponding word, maintaining the order.
   *
   * @param {string} description - The original string containing '#' placeholders for secret words.
   * @param {Array<string>} words - An array of secret words to be inserted into the description.
   * @returns {object} - An object containing the processed description with replaced words
   * and an array of information about the replaced words (index, word, length).
   */
  const prepareDescription = (description, words) => {
    let result = description
    const secretPatternRegex = /#+/g
    const matches = [...description.matchAll(secretPatternRegex)]
    const replacedWordInfo = []

    if (words && Array.isArray(words) && matches && matches.length === words.length) {
      const reversedMatches = [...matches].reverse()
      const reversedWords = [...words].reverse()

      reversedMatches.forEach((match, index) => {
        const startIndex = match.index
        const endIndex = startIndex + match[0].length
        const wordToInsert = reversedWords[index]

        result = result.substring(0, startIndex) + wordToInsert + result.substring(endIndex)

        replacedWordInfo.unshift({
          index: startIndex,
          word: wordToInsert,
          length: wordToInsert.length
        })
      })
    }

    return {
      processedDescription: result,
      replacedWordInfo
    }
  }

  /**
   * @constant processedDescription
   * @description Memoizes the result of the `prepareDescription` function. It takes the book's description
   * and an array of secret words (if available) from `secretsData`. If the `prepareDescription` function
   * returns information about replaced words, it updates the `replacedWords` and `bookDescription` state.
   *
   * @returns {object} - An object containing the processed description (either the original book description
   * if no secrets are available or the description with replaced words) and information about the replaced words.
   *
   * @dependency {string} book.description - The original description of the book.
   * @dependency {Array<string>} secretsData?.words - An array of secret words to potentially insert.
   */
  useMemo(() => {
    const result = prepareDescription(book.description, secretsData?.words || [])
    if (result?.replacedWordInfo) {
      setReplacedWords(result.replacedWordInfo)
      setBookDescription(result?.processedDescription)
    }

    return {
      processedDescription: book.description || result?.processedDescription,
      replacedWordInfo: result?.replacedWordInfo || []
    }
  }, [book.description, secretsData?.words])

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div className='fixed inset-0 flex items-center justify-center z-50'>
          <motion.div
            className='absolute inset-0 bg-black/50 cursor-pointer'
            onClick={onClose}
          />
          <motion.div
            className='relative z-10'
            style={{ perspective: '2000px' }}
          >
            <CardContainer>
              <motion.div
                className='relative flex px-4 py-2 bg-[url(/book.webp)] bg-no-repeat bg-cover rounded-2xl'
                style={{
                  width: bookSize.width,
                  height: bookSize.height,
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
                }}
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 90 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <div
                  className='absolute inset-0 shadow-inner'
                  style={{ zIndex: -1 }}
                />

                <AnimatePresence mode='wait'>
                  <motion.div
                    key={`book-${book?.id}`}
                    className='flex w-full h-full'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Left Page */}
                    <motion.div
                      className='w-1/2 h-full bg-amber-50 p-8 flex flex-col border-r-2 rounded-xl border-amber-900/20 overflow-y-auto'
                      style={{ transformOrigin: 'right center' }}
                    >
                      <h2 className='text-2xl font-serif font-bold text-emerald-900 mb-4'>
                        {bookContent[0].leftPage.title}
                      </h2>
                      <div className='text-gray-700 font-serif flex-grow overflow-y-auto'>
                        {bookContent[0].leftPage.content}
                      </div>
                      {book.description.includes('#') && (
                        <img
                          src='TornPaper.webp'
                          alt='Image of a torn paper'
                          className='absolute top-67 left-67 cursor-pointer size-8'
                          onClick={handleSecretClick}
                        />
                      )}
                      <div className='mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10'>
                        <button
                          disabled
                          className='p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed'
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className='text-sm text-emerald-800 font-serif'>
                          {bookContent[0].leftPage.index}
                        </span>
                      </div>
                    </motion.div>

                    {/* Right Page */}
                    <motion.div
                      className='w-1/2 h-full bg-amber-50 p-8 flex flex-col border-l-2 rounded-xl border-amber-900/20 overflow-y-auto'
                      style={{ transformOrigin: 'left center' }}
                    >
                      <h2 className='text-2xl font-serif font-bold text-emerald-900 mb-4'>
                        {bookContent[0].rightPage.title}
                      </h2>
                      <div className='text-gray-700 font-serif flex-grow overflow-y-auto'>
                        {isUnlocked && animationPhase === 0 && unlockedDescription}
                        {isUnlocked && animationPhase === 1 && (
                          <TextGenerateEffectOriginal
                            words={unlockedDescription || book?.description}
                            className='mt-4'
                          />
                        )}
                        {isUnlocked && animationPhase === 2 && (
                          <TextGenerateEffect
                            words={bookDescription}
                            replacedWordInfo={replacedWords}
                            className='mt-4'
                          />
                        )}
                        {!isUnlocked && bookContent[0].rightPage.content}
                      </div>
                      {animationComplete && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className='mt-4 text-emerald-700 font-magic'
                        >
                          The secrets have been revealed!
                        </motion.div>
                      )}
                      <div className='mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10'>
                        <span className='text-sm text-emerald-800 font-serif'>
                          {bookContent[0].rightPage.index}
                        </span>
                        <button
                          disabled
                          className='p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed'
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </CardContainer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
