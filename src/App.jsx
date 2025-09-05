import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { LocationProvider } from './contexts/LocationContext'
import { UserProvider } from './contexts/UserContext'
import { RecordingProvider } from './contexts/RecordingContext'
import HomePage from './pages/HomePage'
import RightsPage from './pages/RightsPage'
import RecordPage from './pages/RecordPage'
import SubscriptionPage from './pages/SubscriptionPage'
import AppShell from './components/AppShell'

function App() {
  return (
    <LocationProvider>
      <UserProvider>
        <RecordingProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/rights" element={<RightsPage />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
            </Routes>
          </AppShell>
        </RecordingProvider>
      </UserProvider>
    </LocationProvider>
  )
}

export default App