import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LevelProvider } from './context/LevelContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LevelProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LevelProvider>
    </BrowserRouter>
  </StrictMode>,
)