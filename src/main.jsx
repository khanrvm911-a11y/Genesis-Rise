import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LevelProvider } from './context/LevelContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WorkoutProvider } from './context/WorkoutContext.jsx'
import { PowerLevelProvider } from './context/PowerLevelContext.jsx'
import { AvatarProvider } from './context/AvatarContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { OfflineProvider } from './context/OfflineContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <OfflineProvider>
          <AvatarProvider>
          <NotificationProvider>
          <LevelProvider>
            <PowerLevelProvider>
              <WorkoutProvider>
                <App />
              </WorkoutProvider>
            </PowerLevelProvider>
          </LevelProvider>
          </NotificationProvider>
          </AvatarProvider>
          </OfflineProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);