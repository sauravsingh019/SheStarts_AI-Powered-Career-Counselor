# SheStarts — Platform Architecture Document

SheStarts is a fully client-side, single-page web application that provides personalized AI-powered career counseling through a **Heterogeneous Multi-Agent AI System** (9 specialized agents). It runs entirely in the user's browser, making direct API requests to Google Gemini, NVIDIA NIM, and OpenRouter, requiring zero backend server infrastructure.

---

## 1. System Topology

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER (SPA)                             │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Home    │→ │Assessment│→ │ Careers  │→ │ Roadmap  │→ │Dashboard │ │
│  │  (Hero)  │  │ (Settings│  │+ Skill   │  │(30/60/90)│  │+AI Coach │ │
│  └──────────┘  │  Panel)  │  │  Gap     │  └──────────┘  │+Job Asst │ │
│       ↑        └──────────┘  └──────────┘                 │+Voice    │ │
│  ┌──────────┐                                             └──────────┘ │
│  │ Floating │ ← Available on ALL pages (bottom-right corner)           │
│  │ Bot 🤖  │                                                          │
│  └──────────┘                                                          │
│                     ↕ Dynamic Agent API Requests                         │
└──────────────────────────────────────────────────────────────────────────┘
                      ↕                                   ↕
        ┌───────────────────────────┐       ┌───────────────────────────┐
        │     Google Gemini API     │       │      NVIDIA NIM API       │
        │    gemini-3.5-flash       │       │ llama-3.3-70b-instruct    │
        └───────────────────────────┘       └───────────────────────────┘
                      ↕
        ┌───────────────────────────┐
        │      OpenRouter API       │
        │ deepseek/deepseek-chat    │
        │ llama-3-8b-instruct:free  │
        └───────────────────────────┘
```

---

## 2. Heterogeneous Multi-Agent Orchestration

To showcase advanced AI/ML thinking and model routing, the counselor partitions tasks across three distinct LLM providers. If any provider's API key is missing or fails, the agent automatically falls back to Google Gemini to guarantee 100% uptime.

### Model & Provider Routing Table

| Agent Name | Role | Primary Provider | Primary Model | Fallback Provider |
|---|---|---|---|---|
| **ProfileAnalystAgent** | Profile validation & sanitation | *Local JS Rules* | *N/A* | *N/A* |
| **CareerResearchAgent** | Role recommendation & matchmaking | **Google Gemini** | `gemini-3.5-flash` | None (auto-retries on older Gemini models) |
| **SkillCoachAgent** | Skill gap analysis & scores generation | **NVIDIA NIM** | `meta/llama-3.3-70b-instruct` | **Google Gemini** (`gemini-3.5-flash`) |
| **RoadmapPlannerAgent** | 30/60/90 day curriculum generation | **OpenRouter** | `meta-llama/llama-3-8b-instruct:free` | **Google Gemini** (`gemini-3.5-flash`) |
| **InterviewCoachAgent** | Conversational mock interviewer | **OpenRouter** | `deepseek/deepseek-chat` | **Google Gemini** (`gemini-3.5-flash`) |
| **GeneralBotAgent** | Floating Q&A chatbot assistant | **Google Gemini** | `gemini-3.5-flash` | None (standard fallback) |
| **JobApplicationAgent** | Tailored cover letter & resume optimizer | **Google Gemini** | `gemini-3.5-flash` | None (standard fallback) |
| **JobReadinessAgent** | Career path readiness predictor | **NVIDIA NIM** | `meta/llama-3.3-70b-instruct` | **Google Gemini** (`gemini-3.5-flash`) |
| **CareerRiskAgent** | Career transition risk assessor | **OpenRouter** | `deepseek/deepseek-chat` | **Google Gemini** (`gemini-3.5-flash`) |

---

## 3. Data Flow & Security

```
User Input (Form / Resume Paste)
  ↓
In-Memory userData Object
  ↓
callAgentLLM(AgentName, Prompt, SystemPrompt)
  ↓
Try POST /api/chat (Vercel Serverless Function Proxy)
  ├── [If Vercel Production] ──► Reads process.env (GEMINI_API_KEY, NVIDIA_NIM_API_KEY, OPENROUTER_API_KEY)
  │                               Executes server-side fetch securely to LLM endpoint (hides keys from client!)
  └── [If Local Environment] ──► Fallback to browser direct fetch (reads local .env / env.txt / localStorage)
  ↓
parseJSON() [regex cleans markdown backticks if present]
  ↓
Updates UI sections and dashboard scores dynamically
```

### Security Details:
- **Production Key Masking**: When deployed to Vercel, the keys are configured in Vercel's Environment Variables dashboard. The client browser only communicates with the `/api/chat` endpoint on the same origin; keys are never exposed to the client browser or the network tab.
- **Local Fallback**: For local development, keys can be placed in `.env` / `env.txt` or entered manually in the settings panel, cached securely in `localStorage`.


---

## 4. Reliability & Error Recovery

| Mechanism | Description |
|---|---|
| **Dynamic Key Fallback** | If a NIM or OpenRouter key is omitted, the system routes the request to Google Gemini and marks the status as `Gemini Fallback`. |
| **Runtime Auto-Retry** | If a remote provider returns an error (e.g. Rate Limit 429), the code catches the error and retries the request using Google Gemini. |
| **JSON Cleaning** | LLMs (especially DeepSeek/Llama) can wrap JSON responses in markdown backticks. `parseJSON` uses boundary indices to extract clean JSON. |
| **Voice Input Fallback** | Native SpeechRecognition is used; if unsupported, a text input fallback is active. |
