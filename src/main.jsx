import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LevelProvider } from './context/LevelContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WorkoutProvider } from './context/WorkoutContext.jsx'
import { PowerLevelProvider } from './context/PowerLevelContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <LevelProvider>
            <PowerLevelProvider>
              <WorkoutProvider>
                <App />
              </WorkoutProvider>
            </PowerLevelProvider>
          </LevelProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);