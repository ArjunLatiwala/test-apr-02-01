import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function generatePatientInsights(transcript, patientInfo = {}) {
  if (!openai) {
    console.warn('OpenAI not configured, returning mock insights')
    return getMockInsights()
  }

  const systemPrompt = `You are a medical AI assistant analyzing patient intake interview transcripts for diabetes follow-up appointments. 
Your task is to extract key information and provide actionable insights for the healthcare provider.

Analyze the transcript and return a JSON object with the following structure:
{
  "summary": {
    "general_health": "Brief summary of overall health status",
    "vitals": "Summary of reported vitals (weight, blood pressure, pulse)",
    "diet_nutrition": "Summary of dietary habits",
    "lifestyle": "Summary of exercise and lifestyle factors",
    "complications": "Summary of any diabetes-related complications",
    "female_health": "If applicable, summary of female-specific health issues"
  },
  "flagged_concerns": [
    {
      "type": "Concern category (e.g., 'Hospital Visit', 'New Symptoms', 'Sleep Issues')",
      "description": "Detailed description of the concern",
      "severity": "low/medium/high"
    }
  ],
  "risk_scores": {
    "diabetes_complication": 0-10,
    "cardiovascular": 0-10,
    "mental_health": 0-10,
    "sleep_apnea": 0-10
  },
  "recommendations": [
    "Specific actionable recommendation for the healthcare provider"
  ]
}

Focus on identifying:
- Any hospital or ER visits
- New symptoms (tingling, numbness, pain)
- Sleep issues or snoring (sleep apnea risk)
- Mood changes (anxiety, depression)
- Weight fluctuations
- Diet and exercise patterns
- Any red flags that require immediate attention

Patient Info: ${JSON.stringify(patientInfo)}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this patient intake transcript:\n\n${formatTranscript(transcript)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content)
  } catch (error) {
    console.error('OpenAI insight generation failed:', error)
    throw error
  }
}

function formatTranscript(transcript) {
  if (typeof transcript === 'string') return transcript
  
  if (Array.isArray(transcript)) {
    return transcript
      .map(msg => `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.text}`)
      .join('\n')
  }
  
  return JSON.stringify(transcript)
}

function getMockInsights() {
  return {
    summary: {
      general_health: "Patient reports feeling generally okay with some fatigue",
      vitals: "Vitals within normal range",
      diet_nutrition: "Regular meal schedule, some snacking between meals",
      lifestyle: "Limited exercise routine",
      complications: "No new complications reported",
      female_health: "N/A"
    },
    flagged_concerns: [
      {
        type: "Fatigue",
        description: "Patient reports feeling more tired than usual",
        severity: "low"
      }
    ],
    risk_scores: {
      diabetes_complication: 3,
      cardiovascular: 4,
      mental_health: 2,
      sleep_apnea: 3
    },
    recommendations: [
      "Review blood glucose logs",
      "Discuss sleep quality and patterns",
      "Encourage regular exercise routine"
    ]
  }
}

export default openai

