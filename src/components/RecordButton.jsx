import React, { useState, useEffect } from 'react'
import { Mic, Square, Play, AlertTriangle } from 'lucide-react'
import { useRecording } from '../contexts/RecordingContext'
import { useUser } from '../contexts/UserContext'

const RecordButton = ({ variant = 'prominent' }) => {
  const { isRecording, startRecording, stopRecording } = useRecording()
  const { isPremium } = useUser()
  const [recordingTime, setRecordingTime] = useState(0)

  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      // Check if user has permission for recording
      if (!isPremium && false) { // Disable premium check for demo
        alert('Premium subscription required for unlimited recording. Upgrade to continue.')
        return
      }
      
      await startRecording()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (variant === 'discreet') {
    return (
      <button
        onClick={handleRecordingToggle}
        className={`p-3 rounded-full transition-all duration-200 ${
          isRecording 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-gray-200 text-textSecondary hover:bg-gray-300'
        }`}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
    )
  }

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <button
          onClick={handleRecordingToggle}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
              : 'bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-accent/30'
          }`}
        >
          {isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
        
        {isRecording && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-sm text-textSecondary">
        {isRecording ? 'Recording in progress...' : 'Tap to start recording'}
      </p>
      
      {isRecording && (
        <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Keep phone accessible during interaction</span>
        </div>
      )}
      
      <div className="mt-4 text-xs text-textSecondary max-w-xs mx-auto">
        <p>Recording will automatically save with location and timestamp data for your protection.</p>
      </div>
    </div>
  )
}

export default RecordButton