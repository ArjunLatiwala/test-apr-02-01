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
| Backend | Vercel Serverless Functions |
| Database | Supabase PostgreSQL |
| AI Insights | OpenAI GPT-4 |
| Deployment | Vercel |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌──────────────────┐    ┌────────────────────────────────┐ │
│  │  React Frontend  │    │    Serverless Functions        │ │
│  │   (client/dist)  │    │         (/api)                 │ │
│  │                  │    │  ├── auth/login.js             │ │
│  │  ┌────────────┐  │    │  ├── auth/register.js          │ │
│  │  │ Voice Orb  │  │───▶│  ├── sessions/index.js         │ │
│  │  │ Chat UI    │  │    │  ├── sessions/[id].js          │ │
│  │  │ Dashboard  │  │    │  ├── insights/generate/[id].js │ │
│  │  └────────────┘  │    │  └── webhook.js                │ │
│  └──────────────────┘    └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                          │
           ▼                          ▼
    ┌─────────────┐          ┌─────────────────┐
    │  VAPI API   │          │    Supabase     │
    │  (WebRTC)   │          │   PostgreSQL    │
    └─────────────┘          └─────────────────┘
```

## Prerequisites

- Node.js 18+
- VAPI Account ([https://vapi.ai](https://vapi.ai))
- Supabase Account ([https://supabase.com](https://supabase.com))
- OpenAI API Key ([https://platform.openai.com](https://platform.openai.com))
- Vercel CLI (optional, for local development)

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
2. Create a new assistant with the healthcare questionnaire configuration
3. Copy your Assistant ID and Public Key

### 4. Configure Environment Variables

Create `.env` file in the root directory:

```env
# Client (also add to client/.env with VITE_ prefix)
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
VITE_VAPI_ASSISTANT_ID=your_assistant_id

# API (Serverless Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your_openai_key
JWT_SECRET=your_secure_random_string
```

### 5. Run Development Server

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Run development server
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api

## Project Structure

```
doctorAssistantAgent/
├── api/                        # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js           # POST /api/auth/login
│   │   ├── register.js        # POST /api/auth/register
│   │   └── me.js              # GET /api/auth/me
│   ├── sessions/
│   │   ├── index.js           # GET/POST /api/sessions
│   │   ├── [sessionId].js     # GET/PATCH /api/sessions/:id
│   │   └── [sessionId]/
│   │       ├── end.js         # POST /api/sessions/:id/end
│   │       └── insights.js    # GET /api/sessions/:id/insights
│   ├── insights/
│   │   └── generate/
│   │       └── [sessionId].js # POST /api/insights/generate/:id
│   ├── webhook.js             # POST /api/webhook (VAPI)
│   ├── health.js              # GET /api/health
│   └── lib/
│       ├── supabase.js        # Database client
│       ├── openai.js          # AI insights generation
│       └── auth.js            # JWT utilities
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceOrb/      # Animated voice indicator
│   │   │   ├── ChatInterface/ # Text chat fallback
│   │   │   └── Transcript/    # Conversation display
│   │   ├── pages/
│   │   │   ├── PatientInterview.jsx
│   │   │   ├── DoctorLogin.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── SessionDetail.jsx
│   │   ├── hooks/useVapi.js   # VAPI SDK integration
│   │   ├── context/AuthContext.jsx
│   │   └── services/api.js
│   └── package.json
├── supabase/
│   └── schema.sql             # Database schema
├── vercel.json                # Vercel configuration
├── package.json               # Root dependencies
└── README.md
```

## API Endpoints

### Public (Patient)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Create new session |
| POST | `/api/sessions/:id/end` | End session with transcript |
| PATCH | `/api/sessions/:id` | Update session |

### Protected (Doctor - requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Doctor login |
| POST | `/api/auth/register` | Doctor registration |
| GET | `/api/auth/me` | Get current doctor |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/sessions/:id` | Get session details |
| GET | `/api/sessions/:id/insights` | Get session insights |
| POST | `/api/insights/generate/:id` | Generate AI insights |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook` | VAPI call events |

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
vercel env add VITE_VAPI_PUBLIC_KEY
vercel env add VITE_VAPI_ASSISTANT_ID
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure environment variables
4. Deploy

### Post-Deployment

Set up VAPI webhook URL:
```
https://your-domain.vercel.app/api/webhook
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

## License

MIT

## Support

For questions about VAPI integration, visit [docs.vapi.ai](https://docs.vapi.ai)
