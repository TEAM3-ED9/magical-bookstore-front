
import Bookshelf from "@/components/BookShelf"
import { useState } from "react"
import GuideAvatar from "./components/molecules/GuideAvatar"
import { SparklesCore } from "./components/ui/sparkles"

/**
 * The main application component.
 * Renders the background, header, guide avatar, and the bookshelf.
 *
 * @returns {React.ReactElement} The App component.
 */
export default function App() {
  /**
   * State variable to track if the initial loading period is complete.
   * @type {ReturnType<typeof useState<boolean>>
   */
  const [loaded, setLoaded] = useState(false)

  /**
   * State variable to hold the message to be displayed by the guide avatar.
   * @type {ReturnType<typeof useState<string | null>}
   */
  const [guideMessage, setGuideMessage] = useState(null)

  useEffect(() => {
    /**
     * Sets the 'loaded' state to true after a 1.5-second delay, simulating an initial loading period.
     */
    const loadingTimeout = setTimeout(() => {
      setLoaded(true)
    }, 1500)

    /**
     * Cleans up the timeout to prevent memory leaks if the component unmounts.
     */
    return () => clearTimeout(loadingTimeout)
  }, [])

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-[url(/background.webp)] bg-cover" />
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={2}
          particleDensity={20}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      {loaded && <GuideAvatar message={guideMessage} />}
      <main className='relative min-h-screen text-white z-10 overflow-y-hidden'>
        <div className='max-w-7xl mx-auto p-2 md:p-4'>
          <header className='p-4 sm:p-0 sm:pt-2 text-center sm:mb-4'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-HarryPotter text-title sm:text-title/80 mb-2'>
              The Atrio of Rowena
            </h1>
            <p className='text-description sm:text-description/70 text-lg italic'>
              Collections of old magic books of four houses of the Atrio of Rowena
            </p>
          </header>
          {/*
           * Renders the Bookshelf component and passes a callback function to update the guide message.
           * @param {string | null} message - The message to be displayed by the guide.
           */}
          <Bookshelf onSendMessage={setGuideMessage} />
        </div>
      </main>
    </div>
  )
}
