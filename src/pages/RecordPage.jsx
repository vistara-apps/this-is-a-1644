import React from 'react'
import { useRecording } from '../contexts/RecordingContext'
import { useUser } from '../contexts/UserContext'
import RecordButton from '../components/RecordButton'
import IncidentSummaryCard from '../components/IncidentSummaryCard'
import AlertSettings from '../components/AlertSettings'

const RecordPage = () => {
  const { 
    currentRecording, 
    recordedIncidents, 
    saveIncident, 
    discardRecording 
  } = useRecording()
  const { isAuthenticated, signIn } = useUser()
  const [email, setEmail] = React.useState('')

  const handleSaveIncident = (incidentData) => {
    const savedIncident = saveIncident(incidentData)
    alert('Incident saved successfully!')
  }

  const handleDiscardRecording = () => {
    if (confirm('Are you sure you want to discard this recording?')) {
      discardRecording()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-textPrimary mb-4">
            Sign In to Record
          </h1>
          <p className="text-textSecondary mb-6">
            Create an account to access incident recording and documentation features.
          </p>
          
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (email) await signIn(email)
          }} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input w-full"
              required
            />
            <button type="submit" className="btn-primary w-full">
              Sign In / Create Account
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-2">
          Incident Recording
        </h1>
        <p className="text-textSecondary">
          Document interactions safely and discreetly
        </p>
      </div>

      {currentRecording ? (
        <IncidentSummaryCard
          incident={currentRecording}
          onSave={handleSaveIncident}
          onDiscard={handleDiscardRecording}
        />
      ) : (
        <div className="space-y-8">
          {/* Recording Interface */}
          <div className="card text-center">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-textPrimary mb-2">
                Quick Record
              </h2>
              <p className="text-textSecondary text-sm">
                Start recording to document your interaction
              </p>
            </div>
            
            <RecordButton variant="prominent" />
            
            <div className="mt-6 text-xs text-textSecondary bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Recording Guidelines:</p>
              <ul className="space-y-1 text-left">
                <li>• Keep your phone easily accessible</li>
                <li>• Recording is legal in public spaces</li>
                <li>• Audio will be saved with location and timestamp</li>
                <li>• You can add notes after recording stops</li>
              </ul>
            </div>
          </div>

          {/* Emergency Contacts */}
          <AlertSettings variant="contact-selection" />
          
          {/* Alert Settings */}
          <AlertSettings variant="notification-triggers" />

          {/* Recent Incidents */}
          {recordedIncidents.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-textPrimary mb-4">
                Recent Incidents ({recordedIncidents.length})
              </h3>
              <div className="space-y-3">
                {recordedIncidents.slice(-3).reverse().map((incident) => (
                  <div key={incident.incidentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-textPrimary text-sm">
                        {new Date(incident.timestamp).toLocaleDateString()} at{' '}
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-textSecondary">{incident.location}</p>
                    </div>
                    <div className="text-xs text-accent">
                      ✓ Saved
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecordPage