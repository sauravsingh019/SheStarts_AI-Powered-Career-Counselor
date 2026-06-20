# SheStarts — Platform Architecture & System Design

SheStarts is a modern, AI-powered career guidance platform built as a **Single Page Application (SPA)** that delivers personalized career counseling through a **Heterogeneous Multi-Agent AI Architecture** comprising **nine specialized AI agents**. The platform intelligently routes tasks to multiple Large Language Models (LLMs) across different providers, ensuring optimal performance, cost efficiency, and high availability.

The application is designed with a **server-light architecture**. Users interact entirely through the browser, while secure API communication is handled through a lightweight serverless proxy in production, eliminating the need for maintaining dedicated backend infrastructure.

---

# 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER (Single Page App)                   │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Home    │→ │Assessment│→ │ Careers  │→ │ Roadmap  │→ │ Dashboard  │  │
│  │  Landing │  │ & Profile│  │ & Skills │  │ 30/60/90 │  │ AI Coach   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ Job Tools   │  │
│        ↑                                                  │ Voice AI    │  │
│  ┌─────────────┐                                          └────────────┘  │
│  │ Floating AI │   Available Across All Application Pages               │
│  │ Assistant   │                                                        │
│  └─────────────┘                                                        │
│                                                                          │
│              Dynamic Multi-Agent LLM Request Routing                     │
└──────────────────────────────────────────────────────────────────────────┘
                         │                 │                  │
                         ▼                 ▼                  ▼
                 Google Gemini      NVIDIA NIM        OpenRouter
```

---

# 2. Heterogeneous Multi-Agent AI Orchestration

Rather than relying on a single language model, SheStarts distributes responsibilities among specialized AI agents, each optimized for a particular task and routed to the most suitable LLM provider. This heterogeneous architecture improves response quality, reduces operational costs, and increases overall system resilience.

To ensure uninterrupted service availability, every external provider includes an automatic fallback mechanism. Whenever a provider becomes unavailable, encounters rate limits, or lacks a configured API key, requests are seamlessly redirected to Google Gemini.

## AI Agent Routing Matrix

| AI Agent                | Primary Responsibility                                   | Primary Provider        | Model                    | Automatic Fallback    |
| ----------------------- | -------------------------------------------------------- | ----------------------- | ------------------------ | --------------------- |
| **ProfileAnalystAgent** | Profile validation, preprocessing, and data sanitization | Local JavaScript Engine | Rule-Based               | Not Required          |
| **CareerResearchAgent** | Career recommendation and role matching                  | Google Gemini           | `gemini-3.5-flash`       | Legacy Gemini Models  |
| **SkillCoachAgent**     | Skill-gap analysis and competency evaluation             | NVIDIA NIM              | `Llama-3.3-70B-Instruct` | Google Gemini         |
| **RoadmapPlannerAgent** | Personalized 30/60/90-day learning roadmap generation    | OpenRouter              | `Llama-3-8B-Instruct`    | Google Gemini         |
| **InterviewCoachAgent** | AI-powered mock interview sessions                       | OpenRouter              | `DeepSeek Chat`          | Google Gemini         |
| **GeneralBotAgent**     | Universal conversational assistant                       | Google Gemini           | `gemini-3.5-flash`       | Standard Gemini Retry |
| **JobApplicationAgent** | Resume optimization and cover letter generation          | Google Gemini           | `gemini-3.5-flash`       | Standard Gemini Retry |
| **JobReadinessAgent**   | Career readiness assessment and employability scoring    | NVIDIA NIM              | `Llama-3.3-70B-Instruct` | Google Gemini         |
| **CareerRiskAgent**     | Career transition risk assessment                        | OpenRouter              | `DeepSeek Chat`          | Google Gemini         |

---

# 3. Data Flow & Secure API Architecture

```
User Input
(Profile • Assessment • Resume)

        │
        ▼

Client-side Validation
(ProfileAnalystAgent)

        │
        ▼

AI Orchestrator
(callAgentLLM)

        │
        ▼

Production Environment
/api/chat (Serverless Proxy)

        │
        ├── Secure Environment Variables
        │     • GEMINI_API_KEY
        │     • NVIDIA_NIM_API_KEY
        │     • OPENROUTER_API_KEY
        │
        ▼

Selected AI Provider

        │
        ▼

Response Processing
(JSON Sanitization)

        │
        ▼

Dynamic UI Updates
(Dashboard • Roadmaps • Recommendations)
```

## Security Architecture

### Production Deployment

* API credentials are securely stored as **environment variables** within the deployment platform.
* Client applications communicate exclusively with the **`/api/chat` serverless endpoint**.
* API keys remain inaccessible to the browser, preventing exposure through source code, network traffic, or developer tools.
* All external AI communication is executed server-side.

### Local Development

For development and testing purposes, API credentials may be supplied through:

* `.env`
* `env.txt`
* Application Settings Panel

Credentials entered manually are stored only within the browser's local storage for development convenience.

---

# 4. Reliability & Fault Tolerance

The platform incorporates multiple reliability mechanisms to ensure uninterrupted AI services under varying runtime conditions.

| Reliability Feature             | Description                                                                                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automatic Provider Failover** | Requests are transparently redirected to Google Gemini whenever NVIDIA NIM or OpenRouter is unavailable or not configured.                                                              |
| **Runtime Retry Mechanism**     | Temporary failures such as HTTP 429 (Rate Limit) or network interruptions trigger automatic retry using the fallback provider.                                                          |
| **Robust JSON Parsing**         | AI responses enclosed within Markdown code blocks are automatically sanitized before JSON deserialization, ensuring consistent downstream processing.                                   |
| **Voice Input Fallback**        | Native browser Speech Recognition is utilized where supported. When unavailable, the application gracefully falls back to standard text input without interrupting the user experience. |

---

# 5. Key Architectural Highlights

* **Single Page Application (SPA)** architecture with responsive UI.
* **Nine specialized AI agents** operating under a heterogeneous multi-agent framework.
* **Intelligent LLM routing** across Google Gemini, NVIDIA NIM, and OpenRouter.
* **Automatic provider failover** for high availability.
* **Serverless production architecture** with secure API key isolation.
* **Zero dedicated backend maintenance** through lightweight serverless functions.
* **Client-side preprocessing** for reduced latency and improved responsiveness.
* **Secure environment-based credential management** for production deployments.
* **Modular and extensible agent framework**, allowing future AI agents to be integrated with minimal architectural changes.
