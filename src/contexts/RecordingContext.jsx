import React, { createContext, useContext, useState, useRef } from 'react'

const RecordingContext = createContext()

export const useRecording = () => {
  const context = useContext(RecordingContext)
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider')
  }
  return context
}

export const RecordingProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedIncidents, setRecordedIncidents] = useState([])
  const [currentRecording, setCurrentRecording] = useState(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      })
      
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(blob)
        
        const incident = {
          incidentId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          location: getCurrentLocationString(),
          audioBlob: blob,
          audioUrl: audioUrl,
          notes: '',
          sharedWithContacts: false
        }
        
        setCurrentRecording(incident)
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks to release microphone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const saveIncident = (incidentData) => {
    const incident = {
      ...currentRecording,
      ...incidentData,
      savedAt: new Date().toISOString()
    }
    
    const updatedIncidents = [...recordedIncidents, incident]
    setRecordedIncidents(updatedIncidents)
    
    // Save to localStorage (in production, save to backend)
    localStorage.setItem('pocketRights_incidents', JSON.stringify(
      updatedIncidents.map(inc => ({
        ...inc,
        audioBlob: null, // Don't serialize blob
        audioUrl: null   // URLs are temporary
      }))
    ))
    
    setCurrentRecording(null)
    return incident
  }

  const discardRecording = () => {
    if (currentRecording?.audioUrl) {
      URL.revokeObjectURL(currentRecording.audioUrl)
    }
    setCurrentRecording(null)
  }

  const getCurrentLocationString = () => {
    // In production, this would use actual location data
    return 'Current Location'
  }

  const generateIncidentCard = (incident) => {
    return {
      title: 'Incident Documentation',
      timestamp: new Date(incident.timestamp).toLocaleString(),
      location: incident.location,
      duration: 'Recording available',
      rights: 'Know Your Rights information included',
      notes: incident.notes || 'No additional notes'
    }
  }

  // Load incidents from localStorage on mount
  React.useEffect(() => {
    const savedIncidents = localStorage.getItem('pocketRights_incidents')
    if (savedIncidents) {
      setRecordedIncidents(JSON.parse(savedIncidents))
    }
  }, [])

  const value = {
    isRecording,
    recordedIncidents,
    currentRecording,
    startRecording,
    stopRecording,
    saveIncident,
    discardRecording,
    generateIncidentCard
  }

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  )
}