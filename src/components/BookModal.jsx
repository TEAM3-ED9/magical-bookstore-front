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

/**
 * A modal component that displays a book with interactive content, including riddles to unlock restricted content.
 * @module BookModal
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {function(React.MouseEvent<HTMLDivElement> | void): void} props.onClose - Callback function to close the modal.
 * @param {Function} props.onMaxFailedAttempts - Callback function triggered when max failed attempts reached.
 * @param {Function} props.onSendMessage - Callback function to send messages to the parent component.
 * @param {Object} props.book - The book data to display in the modal.
 * @param {number} props.book.id - The unique identifier for the book.
 * @param {string} props.book.title - The title of the book.
 * @param {string} props.book.author - The author of the book.
 * @param {string} props.book.description - The description/content of the book.
 * @param {number} props.book.status - The status of the book (1 for restricted).
 * @returns {React.ReactElement} The BookModal component.
 */
export default function BookModal({ isOpen, onClose, onMaxFailedAttempts, onSendMessage, book }) {
  /**
   * @typedef {Object} QuestionData
   * @property {string} question - The question/riddle to display.
   * @property {string} answer - The correct answer to the question.
   * @property {number} id - The unique identifier for the question.
   */

  /**
   * @typedef {Object} BookPage
   * @property {string} title - The title of the page.
   * @property {string|React.ReactElement} content - The content of the page.
   * @property {number} index - The page number/index.
   */

  /**
   * @typedef {Object} BookContent
   * @property {BookPage} leftPage - The left page content.
   * @property {BookPage} rightPage - The right page content.
   */

  /**
   * State for remaining cooldown time.
   * @type {[string, Function]}
   */
  const [remainingTime, setRemainingTime] = useState('')

  /**
   * State for the current question data.
   * @type {[QuestionData|null, Function]}
   */
  const [questionData, setQuestionData] = useState(null)

  /**
   * State for the user's answer input.
   * @type {[string, Function]}
   */
  const [userAnswer, setUserAnswer] = useState('')

  /**
   * State tracking if the answer was incorrect.
   * @type {[boolean, Function]}
   */
  const [answerIncorrect, setAnswerIncorrect] = useState(false)

  /**
   * State for the submit button text.
   * @type {[string, Function]}
   */
  const [buttonText, setButtonText] = useState('Summon the Owl')

  /**
   * State for controlling text generation effect visibility.
   * @type {[boolean, Function]}
   */
  const [showEffect, setShowEffect] = useState(false)

  /**
   * Context hook for book unlocking functionality.
   * @type {Object}
   * @property {Array} booksUnlocked - List of unlocked book IDs.
   * @property {Object} retryCounts - Mapping of book IDs to retry counts.
   * @property {Object} cooldownEndTimes - Mapping of book IDs to cooldown end times.
   * @property {Function} unlockBook - Function to unlock a book.
   * @property {Function} incrementRetryCount - Function to increment retry count for a book.
   */
  const { booksUnlocked, retryCounts, cooldownEndTimes, unlockBook, incrementRetryCount } =
    useBookUnlock()

  /**
   * Memoized value checking if current book is unlocked.
   * @type {boolean}
   */
  const isUnlocked = useMemo(
    () => booksUnlocked.some((b) => b.bookId === book?.id),
    [booksUnlocked, book?.id]
  )

  /**
   * Memoized retry count for current book.
   * @type {number}
   */
  const retryCount = useMemo(() => retryCounts[book?.id] || 0, [retryCounts, book?.id])

  /**
   * Memoized cooldown end time for current book.
   * @type {number|null}
   */
  const cooldownEndTime = useMemo(
    () => cooldownEndTimes[book?.id] || null,
    [cooldownEndTimes, book?.id]
  )

  /**
   * Memoized value checking if book is in cooldown period.
   * @type {boolean}
   */
  const isInCooldown = useMemo(
    () => retryCount >= 3 && cooldownEndTime && cooldownEndTime > Date.now(),
    [retryCount, cooldownEndTime]
  )

  /**
   * Memoized question API endpoint URL.
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
   * SWR hook for fetching question data.
   * @type {Object}
   * @property {boolean} isLoading - Loading state of the request.
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
   * Effect hook for managing cooldown timer.
   */
  useEffect(() => {
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
   * Custom mutation hook for validating answers.
   * @type {Object}
   * @property {Function} trigger - Function to trigger the mutation.
   */
  const { trigger } = useCustomMutation(API_ENDPOINTS.VALIDATE_QUESTION, {
    fetcher,
    method: 'POST'
  })

  /**
   * Validates the user's answer against the question.
   * @async
   * @function checkAnswer
   * @returns {Promise<void>}
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
        unlockBook(book.id)
        setShowEffect(true)
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
        setShowEffect(false)
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
    onSendMessage
  ])

  /**
   * Effect hook for initializing modal state when opened.
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
   * Memoized restricted content JSX based on current state.
   * @type {React.ReactElement}
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
   * Memoized book content structure.
   * @type {BookContent[]}
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
            book?.status === 1 && !isUnlocked ? restrictedContent : (book?.description ?? ''),
          index: 2
        }
      }
    ],
    [book, restrictedContent, isInCooldown, isUnlocked]
  )

  /**
   * Effect hook for handling escape key to close modal.
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        setShowEffect(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  /**
   * Memoized book size dimensions.
   * @type {Object}
   * @property {string} width - The width of the book.
   * @property {string} height - The height of the book.
   */
  const bookSize = useMemo(() => getBookSize(), [])

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
                        {isUnlocked && !showEffect && book?.description}
                        {isUnlocked && showEffect && (
                          <TextGenerateEffect
                            words={book?.description}
                            className='mt-4'
                          />
                        )}
                        {!isUnlocked && bookContent[0].rightPage.content}
                      </div>
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
