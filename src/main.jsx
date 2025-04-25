import App from '@/App.jsx'
import '@/styles/global.css'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * The main entry point for the React application.
 * Renders the app with StrictMode and NuqsAdapter wrappers.
 *
 * @module Main
 * @description
 * This is the root initialization file that:
 * - Sets up React StrictMode for development checks
 * - Wraps the app with NuqsAdapter for state management
 * - Imports global CSS styles
 * - Mounts the application to the DOM
 *
 * @example
 * // Typical usage in index.html:
 * // <div id="root"></div>
 *
 * @see {@link https://reactjs.org/docs/strict-mode.html} for StrictMode documentation
 * @see {@link https://nuqs.47ng.com} for Nuqs documentation
 */
function initializeApp() {
  /**
   * The root DOM element where the app will be mounted
   * @type {HTMLElement}
   * @constant
   */
  const rootElement = document.getElementById('root')

  /**
   * The React root created for concurrent rendering
   * @type {import('react-dom/client').Root}
   * @constant
   */
  const reactRoot = createRoot(rootElement)

  // Render the application with production-ready configurations
  reactRoot.render(
    /**
     * StrictMode wrapper for highlighting potential problems
     * @see {@link https://reactjs.org/docs/strict-mode.html}
     */
    <StrictMode>
      {/**
       * NuqsAdapter for state management synchronization
       * @see {@link https://nuqs.47ng.com}
       */}
      <NuqsAdapter>
        {/**
         * The main application component
         * @see App
         */}
        <App />
      </NuqsAdapter>
    </StrictMode>
  )
}

// Initialize the application
initializeApp()
