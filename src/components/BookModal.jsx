import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fetcher } from "@/lib/utils"
import { API_ENDPOINTS, SWR_OPTIONS } from "@/lib/constants"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useSWR from "swr"
import { useCustomMutation } from "../lib/utils"

export default function BookModal({ isOpen, onClose, book }) {
  const [questionData, setQuestionData] = useState(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [answerIncorrect, setAnswerIncorrect] = useState(false)

  const getBookSize = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) {
        return { width: "95vw", height: "80vh" }
      } else if (window.innerWidth < 768) {
        return { width: "90vw", height: "70vh" }
      }
    }
    return { width: "700px", height: "450px" }
  }

  const bookSize = getBookSize()

  const { trigger } = useCustomMutation(API_ENDPOINTS.VALIDATE_QUESTION, {
    fetcher,
    method: "POST",
  })

  const checkAnswer = () => {
    const handleCheckAnswer = async () => {
      const answer = userAnswer.trim()
      const normalizedUserAnswer =
        answer.charAt(0).toUpperCase() + answer.slice(1)
      try {
        const data = await trigger({
          body: JSON.stringify({
            question_id: questionData?.id,
            book_id: book?.id,
            answer: normalizedUserAnswer,
          }),
        })
        if (data) {
          setIsUnlocked(data.message.includes("Book unlocked successfully"))
        }
      } catch (error) {
        console.error("Error validating answer:", error)
      }
    }

    handleCheckAnswer()
  }

  const renderRestrictedContent = () => {
    if (loadingQuestion) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/wand-loader.gif"
            alt="Wand Loader"
            className="w-60 h-32 mb-4" // Tamaño grande del gif
          />
          <p className="font-magic text-md text-amber-800">
            The Pensieve is searching for a question...
          </p>
        </div>
      )
    }

    if (!isUnlocked) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-amber-800 font-magic text-md">
            This book is not for beginners! You must ask a question before read
            it...
          </p>
          <p className="font-serif font-semibold text-emerald-900">
            {questionData?.question}
          </p>
          <input
            type="text"
            className="border border-amber-700 p-2 rounded bg-amber-100 text-emerald-900 font-serif"
            placeholder="Your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkAnswer()
              }
            }}
            aria-label="Your answer"
          />
          <button
            onClick={checkAnswer}
            className="bg-emerald-800 text-white font-magic px-4 py-2 rounded hover:bg-emerald-700 transition"
            aria-label="Send Owl"
          >
            Send Owl
          </button>
          {answerIncorrect && (
            <p
              className="text-red-600 text-sm mt-2"
              role="alert"
            >
              Incorrect answer. You are not allowed to read the book yet!
            </p>
          )}
        </div>
      )
    }

    return (
      <p className="text-emerald-900 font-serif">{book?.description ?? ""}</p>
    )
  }

  const bookContent = [
    {
      leftPage: {
        title: book?.title ?? "",
        content: `By ${book?.author ?? ""}`,
        index: 1,
      },
      rightPage: {
        title: book?.status === 1 ? "Restricted Section" : "Description",
        content:
          book?.status === 1
            ? renderRestrictedContent()
            : book?.description ?? "",
        index: 2,
      },
    },
  ]

  const { data, error, isLoading } = useSWR(
    book?.status === 1 ? API_ENDPOINTS.GET_QUESTION + book.id : null,
    fetcher,
    {
      ...SWR_OPTIONS,
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    if (book?.status === 1) {
      setLoadingQuestion(true)
      setIsUnlocked(false)
      setUserAnswer("")
      setAnswerIncorrect(false)

      if (data) {
        setQuestionData(data)
      }

      if (error) {
        setQuestionData({ question: "Failed to load question.", answer: "" })
      }

      setLoadingQuestion(isLoading)
    }
  }, [book, data, error, isLoading])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 cursor-pointer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Close book"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClose()
            }}
          />

          <motion.div
            className="relative z-10"
            style={{ perspective: "2000px" }}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{
              scale: 0.8,
              y: 50,
              opacity: 0,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
          >
            <motion.div
              className="relative flex px-4 py-2 bg-[url(/book.webp)] bg-no-repeat bg-cover rounded-2xl"
              style={{
                width: bookSize.width,
                height: bookSize.height,
                transformStyle: "preserve-3d",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
              }}
              initial={{ rotateX: 30 }}
              animate={{ rotateX: 0 }}
              exit={{
                rotateX: 30,
                transition: { duration: 0.3, ease: "easeIn" },
              }}
            >
              <div
                className="absolute inset-0 shadow-inner"
                style={{ zIndex: -1 }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key="spread-0"
                  className="flex w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Left Page */}
                  <motion.div
                    className="w-1/2 h-full bg-amber-50 p-8 flex flex-col border-r-2 rounded-xl border-amber-900/20 overflow-y-auto"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 15,
                      mass: 0.8,
                      delay: 0.15,
                    }}
                    style={{ transformOrigin: "right center" }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-4">
                      {bookContent[0].leftPage.title}
                    </h2>
                    <p className="text-emerald-900 font-serif flex-grow">
                      {bookContent[0].leftPage.content}
                    </p>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10">
                      <button
                        disabled
                        className="p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm text-emerald-800 font-serif">
                        {bookContent[0].leftPage.index}
                      </span>
                    </div>
                  </motion.div>

                  {/* Right Page */}
                  <motion.div
                    className="w-1/2 h-full bg-amber-50 p-8 flex flex-col border-l-2 rounded-xl border-amber-900/20 overflow-y-auto"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 15,
                      mass: 0.8,
                      delay: 0.15,
                    }}
                    style={{ transformOrigin: "left center" }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-4">
                      {bookContent[0].rightPage.title}
                    </h2>
                    <div className="text-emerald-900 font-serif flex-grow">
                      {bookContent[0].rightPage.content}
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10">
                      <span className="text-sm text-emerald-800 font-serif">
                        {bookContent[0].rightPage.index}
                      </span>
                      <button
                        disabled
                        className="p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
