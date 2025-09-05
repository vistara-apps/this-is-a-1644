import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  console.warn('OpenAI API key not configured. Using mock responses.')
}

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled by a backend
}) : null

// Mock responses for when API is not configured
const mockResponses = {
  trafficStop: {
    english: "Officer, I'm exercising my right to remain silent. I do not consent to any searches of my person or vehicle. Am I free to leave?",
    spanish: "Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento ningún registro de mi persona o vehículo. ¿Soy libre de irme?"
  },
  questioning: {
    english: "I am invoking my right to remain silent and would like to speak with an attorney. I do not consent to any searches.",
    spanish: "Estoy invocando mi derecho a permanecer en silencio y me gustaría hablar con un abogado. No consiento ningún registro."
  },
  arrest: {
    english: "I am not resisting arrest. I am invoking my right to remain silent and request an attorney. I do not consent to any searches.",
    spanish: "No me estoy resistiendo al arresto. Estoy invocando mi derecho a permanecer en silencio y solicito un abogado. No consiento ningún registro."
  }
}

export const aiService = {
  /**
   * Generate contextual scripts for police interactions
   * @param {string} scenario - Type of interaction (traffic, questioning, arrest)
   * @param {string} state - User's current state for state-specific laws
   * @param {string} language - Preferred language (english/spanish)
   * @param {Object} context - Additional context for personalization
   */
  async generateScript(scenario, state, language = 'english', context = {}) {
    if (!openai) {
      // Return mock response if API not configured
      return mockResponses[scenario]?.[language] || mockResponses.questioning[language]
    }

    try {
      const prompt = this.buildScriptPrompt(scenario, state, language, context)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal rights assistant that helps people understand their rights during police interactions. Provide clear, concise, and legally accurate scripts that people can use to assert their rights respectfully. Always emphasize compliance with lawful orders while asserting constitutional rights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })

      return completion.choices[0]?.message?.content?.trim() || mockResponses[scenario]?.[language]
    } catch (error) {
      console.error('Error generating script:', error)
      // Fallback to mock response
      return mockResponses[scenario]?.[language] || mockResponses.questioning[language]
    }
  },

  /**
   * Generate incident summary for sharing
   * @param {Object} incident - Incident data
   * @param {string} language - Preferred language
   */
  async generateIncidentSummary(incident, language = 'english') {
    if (!openai) {
      return this.getMockIncidentSummary(incident, language)
    }

    try {
      const prompt = this.buildSummaryPrompt(incident, language)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal documentation assistant. Create clear, factual summaries of police interactions for documentation purposes. Focus on key details like time, location, and basic facts. Avoid speculation or legal advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2
      })

      return completion.choices[0]?.message?.content?.trim() || this.getMockIncidentSummary(incident, language)
    } catch (error) {
      console.error('Error generating incident summary:', error)
      return this.getMockIncidentSummary(incident, language)
    }
  },

  /**
   * Generate personalized know-your-rights information
   * @param {string} state - User's state
   * @param {string} language - Preferred language
   * @param {Array} scenarios - Specific scenarios to focus on
   */
  async generateRightsGuide(state, language = 'english', scenarios = ['traffic', 'questioning']) {
    if (!openai) {
      return this.getMockRightsGuide(state, language)
    }

    try {
      const prompt = this.buildRightsPrompt(state, language, scenarios)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal education assistant specializing in constitutional rights during police interactions. Provide accurate, state-specific information about legal rights. Always emphasize that this is educational information and not legal advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      })

      return completion.choices[0]?.message?.content?.trim() || this.getMockRightsGuide(state, language)
    } catch (error) {
      console.error('Error generating rights guide:', error)
      return this.getMockRightsGuide(state, language)
    }
  },

  // Helper methods for building prompts
  buildScriptPrompt(scenario, state, language, context) {
    const scenarioDescriptions = {
      traffic: 'traffic stop',
      questioning: 'police questioning',
      arrest: 'arrest situation'
    }

    let prompt = `Generate a respectful but firm script for a ${scenarioDescriptions[scenario]} in ${state}. `
    prompt += `The script should be in ${language === 'spanish' ? 'Spanish' : 'English'}. `
    prompt += `Include key constitutional rights like remaining silent and refusing searches. `
    prompt += `Keep it concise (under 50 words) and easy to remember under stress. `
    
    if (context.timeOfDay) {
      prompt += `This is happening during ${context.timeOfDay}. `
    }
    
    if (context.location) {
      prompt += `The location is ${context.location}. `
    }

    return prompt
  },

  buildSummaryPrompt(incident, language) {
    let prompt = `Create a factual summary of this police interaction incident:\n`
    prompt += `Date/Time: ${new Date(incident.timestamp).toLocaleString()}\n`
    prompt += `Location: ${incident.location_address || incident.location || 'Not specified'}\n`
    
    if (incident.notes) {
      prompt += `Notes: ${incident.notes}\n`
    }
    
    prompt += `\nGenerate a clear, professional summary in ${language === 'spanish' ? 'Spanish' : 'English'} `
    prompt += `suitable for documentation purposes. Include key facts and timeline.`

    return prompt
  },

  buildRightsPrompt(state, language, scenarios) {
    let prompt = `Provide key constitutional rights information for police interactions in ${state}. `
    prompt += `Focus on these scenarios: ${scenarios.join(', ')}. `
    prompt += `Format as bullet points in ${language === 'spanish' ? 'Spanish' : 'English'}. `
    prompt += `Include state-specific variations if any. Keep practical and actionable.`

    return prompt
  },

  // Mock responses for fallback
  getMockIncidentSummary(incident, language) {
    const templates = {
      english: `Incident Documentation Summary
Date: ${new Date(incident.timestamp).toLocaleDateString()}
Time: ${new Date(incident.timestamp).toLocaleTimeString()}
Location: ${incident.location_address || incident.location || 'Location recorded'}
Duration: Audio recording available
Notes: ${incident.notes || 'No additional notes provided'}

This incident has been documented with audio recording and location data for your records.`,
      spanish: `Resumen de Documentación de Incidente
Fecha: ${new Date(incident.timestamp).toLocaleDateString()}
Hora: ${new Date(incident.timestamp).toLocaleTimeString()}
Ubicación: ${incident.location_address || incident.location || 'Ubicación registrada'}
Duración: Grabación de audio disponible
Notas: ${incident.notes || 'No se proporcionaron notas adicionales'}

Este incidente ha sido documentado con grabación de audio y datos de ubicación para sus registros.`
    }

    return templates[language] || templates.english
  },

  getMockRightsGuide(state, language) {
    const templates = {
      english: `Your Constitutional Rights in ${state}:
• You have the right to remain silent
• You can refuse consent to searches
• You have the right to an attorney
• You can ask "Am I free to leave?"
• You may record interactions in public
• Comply physically while asserting rights verbally

Remember: This is educational information, not legal advice.`,
      spanish: `Sus Derechos Constitucionales en ${state}:
• Tiene derecho a permanecer en silencio
• Puede rechazar el consentimiento a registros
• Tiene derecho a un abogado
• Puede preguntar "¿Soy libre de irme?"
• Puede grabar interacciones en público
• Cumpla físicamente mientras afirma sus derechos verbalmente

Recuerde: Esta es información educativa, no asesoramiento legal.`
    }

    return templates[language] || templates.english
  }
}
