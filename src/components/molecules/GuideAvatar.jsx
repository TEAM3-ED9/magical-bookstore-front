import { useEffect, useState } from "react"

const messages = [
  "Young wizard, the secrets of the books await your wit!",
  "Remember, magic requires precision—answer wisely!",
  "The library's enchantments are strict. Proceed with care.",
  "Some books hold ancient spells; others guard dark knowledge.",
  "The books reset when you leave the library—your progress vanishes!",
  "A warning: Three wrong answers lock a book indefinitely.",
  "The Sorting Hat couldn't have chosen better for this challenge!",
  "Only the cleverest witches and wizards unlock these tomes.",
  "The Atrio of Rowena tests your courage and intellect!",
  "Proceed, but tread carefully—mistakes are costly.",
]

const helpMessages = [
  "Click on a book to see its details.",
  "Answer the riddle correctly to unlock a book.",
  "Too many wrong answers will lock the book permanently.",
  "Search by title or author using the search bar.",
  "Leaving the library resets all progress.",
]

export default function GuideAvatar({ message }) {
  // 🗣️ Current displayed message
  const [comment, setComment] = useState(
    "Ah, young wizard, let me prepare myself to answer your questions..."
  )

  // 🎭 Visibility control for messages
  const [isVisible, setIsVisible] = useState(true)

  // 🔄 Normal message cycle index (starts at -1 to display first message)
  const [messageIndex, setMessageIndex] = useState(-1)

  // 🚫 Flag for last normal message
  const [lastMessage, setLastMessage] = useState(false)

  // 🆘 Help message cycle index
  const [helpMessageIndex, setHelpMessageIndex] = useState(0)

  // 🐉 Handle avatar clicks to show help messages
  const handleHelpClick = () => {
    setIsVisible(true)

    // Cycle help messages endlessly
    const newIndex = (helpMessageIndex + 1) % helpMessages.length
    setHelpMessageIndex(newIndex)
    setComment(helpMessages[newIndex])

    // Hide after 3 seconds
    setTimeout(() => setIsVisible(false), 3000)
  }

  // 🎉 Initial welcome message on mount
  useEffect(() => {
    setIsVisible(true)
    setComment(
      "Welcome to the Atrio of Rowena! Some books are locked until you answer correctly. Be cautious—too many wrong answers will lock them permanently for a while."
    )

    // Start normal message cycle after welcome message hides
    const timer = setTimeout(() => setMessageIndex(0), 5000)
    return () => clearTimeout(timer)
  }, [])

  // 📢 Dynamic messages from props (e.g., unlock errors)
  useEffect(() => {
    if (message) {
      setIsVisible(true)
      setComment(message)

      // Hide dynamic message after 3 seconds
      const timer = setTimeout(() => setIsVisible(false), 5000)
      return () => clearTimeout(timer)
    }

    // Hide if message prop is empty
    if (message === "") {
      setIsVisible(false)
    }
  }, [message])

  // 🔄 Cycle through normal messages
  useEffect(() => {
    if (!lastMessage && messageIndex >= 0) {
      const timer = setTimeout(() => {
        setMessageIndex((prevIndex) => {
          const newIndex = prevIndex + 1
          setComment(messages[newIndex])

          // 🛑 Stop cycle at last message and hide after 3 seconds
          if (newIndex === messages.length - 1) {
            setLastMessage(true)
            setTimeout(() => setIsVisible(false), 3000)
          }
          return newIndex
        })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [messageIndex, lastMessage, messages.length])

  // 🔍 Show search tip after normal messages finish
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true)
      setComment("You can search books by title or author...")
    }, 2000 + messages.length * 3000) // After all normal messages

    const hideTimer = setTimeout(
      () => setIsVisible(false),
      5000 + messages.length * 3000
    )

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [messages.length])

  return (
    <article className="fixed bottom-5 left-5 z-20">
      <div
        className="relative cursor-pointer"
        onClick={handleHelpClick}
      >
        {/* 🖼️ Guide avatar images */}
        <div className="relative size-20">
          <img
            src="/frame.webp"
            alt="Frame"
            className="size-20 absolute"
          />
          <img
            src="/rowena.webp"
            alt="Rowena"
            className="w-12 h-12 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full"
          />
        </div>

        {/* 🎬 Dynamic message overlay (e.g., unlock errors) */}
        {message && (
          <div className="absolute left-24 top-1/2 -translate-y-1/2 rounded-lg text-white">
            <div className="relative">
              <span className="inline-block py-3 px-5 text-lg bg-black rounded-lg shadow-md min-w-68 text-nowrap max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                {comment}
              </span>
              {/* 🔼 Speech bubble pointer */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-black"></div>
            </div>
          </div>
        )}

        {/* 📚 Normal/help messages */}
        {!message && isVisible && (
          <div className="absolute left-24 top-1/2 -translate-y-1/2 rounded-lg text-white">
            <div className="relative">
              <span className="inline-block py-3 px-5 text-lg bg-black rounded-lg shadow-md min-w-68 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                {comment}
              </span>
              {/* 🔼 Speech bubble pointer */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-black"></div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
