import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/styles/global.css"
import App from "@/App.jsx"
import { NuqsAdapter } from "nuqs/adapters/react"
import { BookUnlockProvider } from "./contexts/BookUnlock"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NuqsAdapter>
      <BookUnlockProvider>
        <App />
      </BookUnlockProvider>
    </NuqsAdapter>
  </StrictMode>
)
