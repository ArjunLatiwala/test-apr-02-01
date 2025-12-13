# Doctor Assistant - AI Voice Agent

A mobile-first web application for patient intake interviews powered by VAPI real-time voice AI. The application conducts diabetes follow-up questionnaires through voice interaction, stores transcripts, and provides AI-powered insights for healthcare providers.

## Features

### Patient Interface
- **Voice-first interaction**: Natural conversation with AI assistant
- **Real-time transcription**: See the conversation as it happens
- **Chat fallback**: Type responses when voice isn't available
- **Mobile-optimized**: Beautiful, responsive design for any device

### Doctor Dashboard
- **Session overview**: View all patient interviews
- **AI-powered insights**: Automatic analysis of patient responses
- **Risk scoring**: Identify patients needing immediate attention
- **Full transcripts**: Access complete conversation history

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Voice AI | VAPI Real-time SDK |
| Backend | Node.js + Express |
| Database | Supabase PostgreSQL |
| AI Insights | OpenAI GPT-4 |
| Deployment | Vercel |

## Prerequisites

- Node.js 18+
- VAPI Account ([https://vapi.ai](https://vapi.ai))
- Supabase Account ([https://supabase.com](https://supabase.com))
- OpenAI API Key ([https://platform.openai.com](https://platform.openai.com))

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/smukerji/doctorAssistantAgent.git
cd doctorAssistantAgent
npm run install:all
```

### 2. Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and service role key

### 3. Create VAPI Assistant

1. Sign up at [vapi.ai](https://vapi.ai)
2. Create a new assistant with the healthcare questionnaire configuration (see `server/lib/vapi.js`)
3. Copy your Assistant ID and Public Key

### 4. Configure Environment Variables

Create `.env` files:

**client/.env**
```env
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
VITE_VAPI_ASSISTANT_ID=your_assistant_id
```

**server/.env**
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_webhook_secret

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

OPENAI_API_KEY=sk-your_openai_key

JWT_SECRET=your_secure_random_string
```

### 5. Run Development Server

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
doctorAssistantAgent/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── VoiceOrb/       # Animated voice indicator
│   │   │   ├── ChatInterface/  # Text chat fallback
│   │   │   └── Transcript/     # Conversation display
│   │   ├── pages/              # Route pages
│   │   │   ├── PatientInterview.jsx
│   │   │   ├── DoctorLogin.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── SessionDetail.jsx
│   │   ├── hooks/
│   │   │   └── useVapi.js      # VAPI SDK integration
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Doctor authentication
│   │   └── services/
│   │       └── api.js          # Backend API client
│   └── package.json
├── server/                     # Node.js Backend
│   ├── api/
│   │   ├── auth.js             # Doctor authentication
│   │   ├── sessions.js         # Patient sessions
│   │   ├── insights.js         # AI insights
│   │   └── webhook.js          # VAPI webhooks
│   ├── lib/
│   │   ├── supabase.js         # Database client
│   │   ├── openai.js           # AI insights generation
│   │   └── vapi.js             # VAPI configuration
│   └── index.js
├── supabase/
│   └── schema.sql              # Database schema
├── vercel.json                 # Deployment config
└── README.md
```

## Questionnaire Flow

The voice assistant follows a structured 7-section diabetes follow-up questionnaire:

1. **Introduction & General Update** - Overall health, recent visits
2. **Home Vitals & Weight** - Recent measurements
3. **Diet & Nutrition** - Eating habits, fluid intake
4. **Lifestyle & Symptoms** - Exercise, sleep, mood
5. **Diabetes Complications** - Specific symptom screening
6. **Female-Specific Health** - (Conditional) Hormonal health
7. **Conclusion** - Thank you and handoff

## AI Insights

The system generates comprehensive insights including:

- **Summary**: Structured overview of patient responses
- **Flagged Concerns**: Automatic detection of health issues
- **Risk Scores**: Quantified assessment (0-10) for:
  - Diabetes complications
  - Cardiovascular risk
  - Mental health
  - Sleep apnea risk
- **Recommendations**: AI-suggested follow-up actions

## Deployment to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Set up VAPI webhook URL: `https://your-domain.vercel.app/api/webhook`

## API Endpoints

### Public (Patient)
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:id/end` - End session with transcript

### Protected (Doctor)
- `POST /api/auth/login` - Doctor login
- `POST /api/auth/register` - Doctor registration
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/insights/generate/:id` - Generate AI insights

### Webhooks
- `POST /api/webhook` - VAPI call events

## License

MIT

## Support

For questions about VAPI integration, visit [docs.vapi.ai](https://docs.vapi.ai)
