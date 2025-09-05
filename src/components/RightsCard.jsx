import React, { useState } from 'react'
import { Copy, Check, Globe } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const RightsCard = ({ stateData, variant = 'state-specific' }) => {
  const { preferredLanguage, setPreferredLanguage } = useUser()
  const [copiedText, setCopiedText] = useState('')

  if (!stateData) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-textSecondary">Enable location access to see your state-specific rights</p>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label)
      setTimeout(() => setCopiedText(''), 2000)
    })
  }

  const toggleLanguage = () => {
    setPreferredLanguage(preferredLanguage === 'english' ? 'spanish' : 'english')
  }

  if (variant === 'bilingual-script') {
    const scripts = stateData.scripts[preferredLanguage]
    
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Quick Scripts</h3>
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm">{preferredLanguage === 'english' ? 'EN' : 'ES'}</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-textPrimary mb-2">Traffic Stop</h4>
            <div className="bg-gray-50 p-4 rounded-md relative">
              <p className="text-sm text-textPrimary">{scripts.traffic}</p>
              <button
                onClick={() => copyToClipboard(scripts.traffic, 'traffic')}
                className="absolute top-2 right-2 p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copiedText === 'traffic' ? 
                  <Check className="h-4 w-4 text-accent" /> : 
                  <Copy className="h-4 w-4 text-textSecondary" />
                }
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-textPrimary mb-2">Questioning</h4>
            <div className="bg-gray-50 p-4 rounded-md relative">
              <p className="text-sm text-textPrimary">{scripts.questioning}</p>
              <button
                onClick={() => copyToClipboard(scripts.questioning, 'questioning')}
                className="absolute top-2 right-2 p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copiedText === 'questioning' ? 
                  <Check className="h-4 w-4 text-accent" /> : 
                  <Copy className="h-4 w-4 text-textSecondary" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold">Your Rights</h3>
          <p className="text-sm text-textSecondary">
            State-specific information for {stateData.abbreviation}
          </p>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">{preferredLanguage === 'english' ? 'EN' : 'ES'}</span>
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-textPrimary mb-3 flex items-center">
            🚗 Traffic Stops
          </h4>
          <ul className="space-y-2">
            {stateData.rightsGuide.traffic.map((right, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-textPrimary">{right}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-textPrimary mb-3 flex items-center">
            ❓ Police Questioning
          </h4>
          <ul className="space-y-2">
            {stateData.rightsGuide.questioning.map((right, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-textPrimary">{right}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
        <p className="text-xs text-textSecondary">
          💡 <strong>Remember:</strong> Always remain calm, comply physically while asserting your rights verbally, and never lie to officers.
        </p>
      </div>
    </div>
  )
}

export default RightsCard