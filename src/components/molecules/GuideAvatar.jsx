import { useEffect, useState } from "react"

const messages = [
  "Young wizard",
  "Welcome to the Atrio of Rowena",
  "Here you can find the best books of the four houses",
  "I hope you enjoy your stay here",
  "There are some books with hidden content",
  "To unlock them you must answer a question correctly",
  "If you need help, just ask me",
]

const helpMessage = "Click on a book to see more details"

export default function GuideAvatar() {
  const [comment, setComment] = useState(messages[0])
  const [isVisible, setIsVisible] = useState(true)
  const [messageIndex, setMessageIndex] = useState(0)
  const [lastMessage, setLastMessage] = useState(false)
  const [clickForHelp, setClickForHelp] = useState(false)

  const handleHelpClick = () => {
    if (messageIndex === messages.length - 1) {
      if (clickForHelp) {
        setClickForHelp(false)
        setIsVisible(false)
      } else {
        setClickForHelp(true)
        setIsVisible(true)
        setComment(helpMessage)

        setTimeout(() => {
          setClickForHelp(false)
          setIsVisible(false)
        }, 5000)
      }
    }
  }

  useEffect(() => {
    if (!lastMessage) {
      const timer = setTimeout(() => {
        setMessageIndex((prevIndex) => {
          const newIndex = prevIndex + 1
          setComment(messages[newIndex])

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

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true)
      setComment("You can search books by title or author...")
    }, 2000 + messages.length * 3000)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5000 + messages.length * 3000)

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
        <div className="relative size-20">
          <img
            src="frame.webp"
            alt="Image of a frame"
            className="size-20 absolute"
          />
          <img
            src="rowena.webp"
            alt="Image of Rowena from Harry Potter"
            className="w-12 h-12 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full"
          />
        </div>
        {isVisible && (
          <div className="absolute left-24 top-1/2 -translate-y-1/2 rounded-lg text-white">
            <div className="relative">
              <span
                className="inline-block py-3 px-5 text-lg bg-black rounded-lg shadow-md text-nowrap"
                style={{ width: "auto" }}
              >
                {comment}
              </span>
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-black"></div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
