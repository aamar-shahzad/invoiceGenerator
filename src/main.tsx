import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const swPath = `${import.meta.env.BASE_URL}sw.js`
      await navigator.serviceWorker.register(swPath)
    } catch {
      // Service worker registration failure should not block app usage.
    }
  })
}
