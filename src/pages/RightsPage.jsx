import React from 'react'
import { AlertTriangle, MapPin, Globe } from 'lucide-react'
import { useLocation } from '../contexts/LocationContext'
import RightsCard from '../components/RightsCard'

const RightsPage = () => {
  const { currentState, getStateData, requestLocation, permissionGranted, loading } = useLocation()
  const stateData = getStateData()

  if (!permissionGranted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-textPrimary mb-4">
            Know Your Rights
          </h1>
          <p className="text-textSecondary mb-8 max-w-2xl mx-auto">
            To provide you with accurate, state-specific legal rights information, 
            we need access to your location.
          </p>
          <button
            onClick={requestLocation}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Getting Location...' : 'Enable Location Access'}
          </button>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-yellow-800 font-medium">Why we need location access:</p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Legal rights vary significantly between states</li>
                  <li>• Provides accurate, jurisdiction-specific information</li>
                  <li>• Ensures you get the most relevant legal guidance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-2">
          Know Your Rights
        </h1>
        <div className="flex items-center justify-center space-x-2 text-textSecondary">
          <MapPin className="h-4 w-4" />
          <span>Legal information for {currentState}</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Rights Card */}
        <RightsCard stateData={stateData} variant="state-specific" />
        
        {/* Scripts Card */}
        <RightsCard stateData={stateData} variant="bilingual-script" />
        
        {/* Important Reminders */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📝 Important Reminders
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p><strong>Stay Calm:</strong> Remain composed and respectful during all interactions</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p><strong>Comply Physically:</strong> Do not resist arrest, even if you believe it's unlawful</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p><strong>Assert Rights Verbally:</strong> Clearly state your rights while following commands</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p><strong>Document Everything:</strong> Use our recording feature when safe to do so</p>
            </div>
          </div>
        </div>
        
        {/* Legal Disclaimer */}
        <div className="text-center text-xs text-textSecondary bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Legal Disclaimer:</strong> This information is for educational purposes only 
            and does not constitute legal advice. Laws vary by jurisdiction and situation. 
            For specific legal guidance, consult with a qualified attorney.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RightsPage