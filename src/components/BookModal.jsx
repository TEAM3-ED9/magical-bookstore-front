import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetcher, getBookSize, useCustomMutation } from "@/lib/utils"; // Combined imports
import { API_ENDPOINTS, SWR_OPTIONS } from "@/lib/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useSWR from "swr";
import { useBookUnlock } from "../contexts/BookUnlock"; // Corrected path if needed
import { formatTime } from "../lib/utils";

export default function BookModal({
  isOpen,
  onClose,
  onMaxFailedAttempts,
  onSendMessage,
  book,
}) {
  const [remainingTime, setRemainingTime] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerIncorrect, setAnswerIncorrect] = useState(false);
  const [buttonText, setButtonText] = useState("Summon the Owl");
  const {
    booksUnlocked,
    retryCounts,
    cooldownEndTimes,
    unlockBook,
    incrementRetryCount,
  } = useBookUnlock();

  const isUnlocked = useMemo(
    () => booksUnlocked.some((b) => b.bookId === book?.id),
    [booksUnlocked, book?.id]
  );

  const retryCount = useMemo(
    () => retryCounts[book?.id] || 0,
    [retryCounts, book?.id]
  );

  const cooldownEndTime = useMemo(
    () => cooldownEndTimes[book?.id] || null,
    [cooldownEndTimes, book?.id]
  );

  const isInCooldown = useMemo(
    () => retryCount >= 3 && cooldownEndTime && cooldownEndTime > Date.now(),
    [retryCount, cooldownEndTime]
  );

  const questionQuery = useMemo(
    () =>
      book?.status === 1 && !isUnlocked && !isInCooldown
        ? API_ENDPOINTS.GET_QUESTION + book.id
        : null,
    [book, isUnlocked, isInCooldown]
  );

  const {
    data: fetchedQuestionData,
    error,
    isLoading,
  } = useSWR(questionQuery, fetcher, {
    ...SWR_OPTIONS,
    revalidateOnFocus: false,
    onSuccess: (data) => {
      setQuestionData(data);
      setUserAnswer("");
      setAnswerIncorrect(false);
    },
    onError: () => {
      if (questionQuery) {
        setQuestionData({ question: "Failed to load question.", answer: "" });
      } else {
        setQuestionData(null);
      }
    },
  });

  useEffect(() => {
    let timerInterval = null;

    if (isInCooldown && cooldownEndTime) {
      const updateTimer = () => {
        const now = Date.now();
        const msLeft = cooldownEndTime - now;

        if (msLeft <= 0) {
          setRemainingTime("00:00");
          clearInterval(timerInterval);
        } else {
          setRemainingTime(formatTime(msLeft));
        }
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      setRemainingTime("");
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isInCooldown, cooldownEndTime, book?.id]);

  const { trigger } = useCustomMutation(API_ENDPOINTS.VALIDATE_QUESTION, {
    fetcher,
    method: "POST",
  });

  const checkAnswer = useCallback(async () => {
    const answer = userAnswer.trim();
    if (!answer || !questionData?.id || !book?.id || isUnlocked || isInCooldown)
      return;

    const normalizedUserAnswer =
      answer.charAt(0).toUpperCase() + answer.slice(1);

    try {
      const data = await trigger({
        body: JSON.stringify({
          question_id: questionData.id,
          book_id: book.id,
          answer: normalizedUserAnswer,
        }),
      });

      if (data?.message?.includes("Book unlocked successfully")) {
        unlockBook(book.id);
        onSendMessage(
          "Well done! The book is unlocked. But remember, leaving the library will reset all books"
        );
      }
    } catch (error) {
      console.error("Error validating answer:", error);

      const currentRetryCount = retryCounts[book.id] || 0;
      incrementRetryCount(book.id);
      setAnswerIncorrect(true);

      if (currentRetryCount + 1 === 1) {
        onSendMessage("Be careful! That's your first wrong answer.");
        setTimeout(() => {
          onSendMessage("");
        }, 3000);
      } else if (currentRetryCount + 1 === 2) {
        onSendMessage("Careful now—only one more try before this book locks!");
        setTimeout(() => {
          onSendMessage("");
        }, 3000);
      }

      if (currentRetryCount + 1 >= 3) {
        onSendMessage("We must clear all this messy library...");
        onMaxFailedAttempts();
        onClose();
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
  ]);

  useEffect(() => {
    if (isOpen && !isUnlocked && !isInCooldown) {
      if (book.status === 1) {
        onSendMessage(
          "Answer the riddle correctly to unlock this book's secrets!"
        );

        setTimeout(() => {
          onSendMessage("");
        }, 3000);
      }

      const texts = ["Summon the Owl", "Send the Owl", "Dispatch the Owl"];
      setButtonText(texts[Math.floor(Math.random() * 3)]);
    }
  }, [isOpen, isUnlocked, isInCooldown, onSendMessage]);

  const restrictedContent = useMemo(() => {
    if (isInCooldown) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-4">
          <p className="font-magic text-lg text-red-700">
            Too many failed attempts!
          </p>
          <p className="font-serif text-md text-amber-900">
            The magic protecting this book needs time to settle. Please wait:
          </p>
          <p
            className="font-mono text-4xl font-bold text-emerald-900 tracking-wider"
            aria-live="polite"
          >
            {remainingTime}
          </p>
          <p className="font-serif text-sm text-gray-600">
            (You can close this book while waiting)
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/wand-loader.gif"
            alt="Wand Loader"
            className="w-60 h-32 mb-4"
          />
          <p className="font-magic text-md text-amber-800">
            The Pensieve is searching for a question...
          </p>
        </div>
      );
    }

    if (!isUnlocked) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-amber-800 font-magic text-md">
            This tome is enchanted! You must answer a riddle before its secrets
            are revealed...
          </p>
          <p className="font-serif font-semibold text-emerald-900">
            {questionData?.question || "Loading riddle..."}{" "}
          </p>
          <p className="font-serif font-semibold text-emerald-900">{questionData?.question}</p>
          <input
            type="text"
            className="border border-amber-700 p-2 rounded bg-amber-100 text-emerald-900 font-serif"
            placeholder="Your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
<<<<<<< HEAD
=======
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkAnswer();
              }
            }}
            aria-label="Your answer"
>>>>>>> 273b6083ce48cc8229fcbdae36842efc1e6dad70
          />
          {answerIncorrect && (
            <p className="text-red-600 text-sm -mt-3" role="alert">
              {retryCount === 1
                ? "Your first attempt was incorrect. Try again!"
                : retryCount === 2
                ? "Still not quite right. Think carefully!"
                : "Alas, your answer is incorrect."}{" "}
            </p>
          )}
          <button
            onClick={checkAnswer}
            className="bg-emerald-800 text-white font-magic px-4 py-2 rounded hover:bg-emerald-700 transition"
            aria-label="Send Owl"
            disabled={!questionData?.question}
          >
            {buttonText}
          </button>
        </div>
      );
    }

    return (
<<<<<<< HEAD
      <p className="text-emerald-900 font-serif">
        {book?.description ?? ""}
      </p>
    )
=======
      <p className="text-emerald-900 font-serif">{book?.description ?? ""}</p>
    );
>>>>>>> 273b6083ce48cc8229fcbdae36842efc1e6dad70
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
    book?.description,
    buttonText,
  ]);

  const bookContent = useMemo(
    () => [
      {
        leftPage: {
          title: book?.title ?? "",
          content: `By ${book?.author ?? ""}`,
          index: 1,
        },
        rightPage: {
          title: isInCooldown
            ? "Cooldown Active"
            : book?.status === 1 && !isUnlocked
            ? "Restricted Section"
            : "Description",
          content:
            book?.status === 1 && !isUnlocked
              ? restrictedContent
              : book?.description ?? "",
          index: 2,
        },
      },
    ],
    [book, restrictedContent, isInCooldown, isUnlocked]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const bookSize = useMemo(() => getBookSize(), []);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            className="absolute inset-0 bg-black/50 cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10"
            style={{ perspective: "2000px" }}
          >
            <motion.div
              className="relative flex px-4 py-2 bg-[url(/book.webp)] bg-no-repeat bg-cover rounded-2xl"
              style={{
                width: bookSize.width,
                height: bookSize.height,
                transformStyle: "preserve-3d",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="absolute inset-0 shadow-inner" style={{ zIndex: -1 }} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`book-${book?.id}`}
                  className="flex w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Left Page */}
                  <motion.div
                    className="w-1/2 h-full bg-amber-50 p-8 flex flex-col border-r-2 rounded-xl border-amber-900/20 overflow-y-auto"
                    style={{ transformOrigin: "right center" }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-4">
                      {bookContent[0].leftPage.title}
                    </h2>
                    <div className="text-emerald-900 font-serif flex-grow overflow-y-auto">
                      {" "}
                      {bookContent[0].leftPage.content}
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10">
                      <button disabled className="p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed">
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
                    style={{ transformOrigin: "left center" }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-4">
                      {bookContent[0].rightPage.title}
                    </h2>
                    <div className="text-emerald-900 font-serif flex-grow overflow-y-auto">
                      {bookContent[0].rightPage.content}
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-amber-900/10">
                      <span className="text-sm text-emerald-800 font-serif">
                        {bookContent[0].rightPage.index}
                      </span>
                      <button disabled className="p-2 rounded-full text-emerald-900 opacity-30 cursor-not-allowed">
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
  );
}
