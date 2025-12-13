// Healthcare-specific prompts for AI insight generation

export const INSIGHT_SYSTEM_PROMPT = `You are a medical AI assistant analyzing patient intake interview transcripts for diabetes follow-up appointments. Your task is to extract key information and provide actionable insights for the healthcare provider.

CRITICAL ANALYSIS AREAS:

1. GENERAL HEALTH STATUS
   - Overall well-being changes
   - Recent illnesses or hospitalizations
   - Other doctor visits or surgeries
   - New lab work or tests

2. VITAL SIGNS & MEASUREMENTS
   - Weight changes (current vs historical)
   - Blood pressure readings
   - Pulse rate
   - BMI implications

3. DIET & NUTRITION PATTERNS
   - Meal frequency and timing
   - Snacking behaviors
   - Fluid intake (type and amount)
   - Alcohol consumption

4. LIFESTYLE FACTORS
   - Exercise frequency and type
   - Sleep quality
   - Constipation/diarrhea issues
   - Mental health (anxiety, depression)

5. DIABETES COMPLICATIONS
   - Gastrointestinal symptoms
   - Sleep apnea indicators (snoring, fatigue)
   - Neuropathy signs (tingling, numbness)
   - Joint pain

6. FEMALE-SPECIFIC (if applicable)
   - Menstrual changes
   - Perimenopause/menopause status
   - Hormone replacement therapy

OUTPUT REQUIREMENTS:
Return a structured JSON with clear, actionable insights that help the healthcare provider quickly understand the patient's status and any areas of concern.`

export const RISK_SCORING_CRITERIA = {
  diabetes_complication: {
    description: 'Risk of diabetes-related complications',
    indicators: [
      'Neuropathy symptoms (tingling, numbness)',
      'Cardiovascular symptoms',
      'Vision changes',
      'Kidney function concerns',
      'Poor blood sugar control indicators'
    ]
  },
  cardiovascular: {
    description: 'Cardiovascular health risk',
    indicators: [
      'High blood pressure readings',
      'Weight gain/obesity',
      'Sedentary lifestyle',
      'Poor diet (high sodium, alcohol)',
      'Stress/anxiety'
    ]
  },
  mental_health: {
    description: 'Mental health concern level',
    indicators: [
      'Reported anxiety or depression',
      'Sleep disturbances',
      'Social isolation indicators',
      'Mood changes',
      'Stress levels'
    ]
  },
  sleep_apnea: {
    description: 'Sleep apnea risk',
    indicators: [
      'Loud snoring reported',
      'Daytime fatigue despite sleep',
      'Obesity/overweight',
      'Large neck circumference',
      'Morning headaches'
    ]
  }
}

export const CONCERN_CATEGORIES = [
  {
    type: 'Emergency Visit',
    description: 'Patient visited ER or urgent care',
    severity: 'high'
  },
  {
    type: 'Hospital Admission',
    description: 'Patient was hospitalized',
    severity: 'high'
  },
  {
    type: 'New Symptoms',
    description: 'Patient reports new concerning symptoms',
    severity: 'medium'
  },
  {
    type: 'Neuropathy Signs',
    description: 'Tingling, numbness, or pain in extremities',
    severity: 'medium'
  },
  {
    type: 'Sleep Issues',
    description: 'Sleep apnea risk indicators',
    severity: 'medium'
  },
  {
    type: 'Mental Health',
    description: 'Anxiety or depression symptoms',
    severity: 'medium'
  },
  {
    type: 'Weight Change',
    description: 'Significant weight fluctuation',
    severity: 'low'
  },
  {
    type: 'Diet Concerns',
    description: 'Poor dietary habits noted',
    severity: 'low'
  }
]

export const RECOMMENDATION_TEMPLATES = {
  emergency_visit: 'Review details of emergency/urgent care visit and follow up on any prescribed treatments',
  neuropathy: 'Conduct detailed neurological examination; consider nerve conduction studies',
  sleep_apnea: 'Recommend sleep study evaluation; discuss sleep hygiene',
  mental_health: 'Screen for depression/anxiety; consider referral to mental health specialist',
  weight_management: 'Discuss weight management strategies; consider nutritionist referral',
  diet_counseling: 'Provide dietary counseling; review carbohydrate intake',
  exercise_plan: 'Develop personalized exercise plan appropriate for patient condition',
  blood_pressure: 'Monitor blood pressure closely; consider medication adjustment',
  medication_review: 'Review current medications for optimization'
}

export function formatTranscriptForAnalysis(transcript) {
  if (typeof transcript === 'string') return transcript
  
  if (Array.isArray(transcript)) {
    return transcript
      .map(msg => {
        const role = msg.role === 'user' ? 'PATIENT' : 'ASSISTANT'
        return `${role}: ${msg.text}`
      })
      .join('\n\n')
  }
  
  return JSON.stringify(transcript, null, 2)
}

