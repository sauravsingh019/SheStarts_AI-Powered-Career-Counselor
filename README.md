# SheStarts – AI-Powered Career Counselor

SheStarts is an AI-powered career counseling platform designed to help women confidently restart their careers after an employment break. The platform combines intelligent career recommendations, skill gap analysis, resume understanding, interview coaching, and job application assistance into a single personalized experience.

Built as a lightweight **Single Page Application (SPA)**, SheStarts requires **no build process or external dependencies**, enabling fast deployment and seamless user experience.

---

# 🚀 Features

| Module                          | Description                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Profile Assessment**          | Collects education, work experience, career gap, skills, career goals, preferred schedule, and learning availability. |
| **Resume Analyzer**             | Upload or paste resume content to automatically populate the assessment form using AI.                                |
| **Career Recommendations**      | Generates personalized career paths with salary estimates, required effort, remote-work availability, and reasoning.  |
| **Skill Gap Analysis**          | Compares existing skills against industry requirements and identifies learning priorities.                            |
| **90-Day Career Roadmap**       | Creates a structured learning roadmap with milestones, free learning resources, and weekly objectives.                |
| **Employability Assessment**    | Calculates Employability and Confidence Scores using AI-driven evaluation.                                            |
| **AI Career Coach**             | Context-aware conversational assistant providing personalized career guidance.                                        |
| **AI Interview Coach**          | Voice-enabled mock interview practice with speech recognition and text-to-speech support.                             |
| **Job Application Assistant**   | Generates cover letters, LinkedIn headlines, ATS keywords, and resume improvements based on job descriptions.         |
| **Multi-Agent Workflow Viewer** | Displays the active AI model and specialist agent handling each task for transparency.                                |
| **Dark Mode & Responsive UI**   | Optimized experience across desktop, tablet, and mobile devices.                                                      |

---

# 🏗️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6)
* Responsive SPA Architecture

### AI Providers

* Google Gemini (Gemini 2.5 Flash)
* NVIDIA NIM (Llama 3.3 70B Instruct)
* OpenRouter (DeepSeek Chat)

### Browser APIs

* Speech Recognition API
* Speech Synthesis API
* Fetch API
* Local Browser Storage (Session Only)

### UI & Assets

* Google Fonts (Inter)
* Tabler Icons

---

# 📂 Project Structure

```
SheStarts/
│
├── index.html                  # Main Single Page Application
├── README.md
├── DEPLOYMENT.md
├── PRODUCT_THINKING.md
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── screenshots/
│
├── css/
│   ├── style.css               # Global styles
│   ├── components.css          # Reusable UI components
│   └── responsive.css          # Mobile responsiveness
│
├── js/
│   ├── app.js                  # Application entry point
│   ├── state.js                # Global state management
│   ├── ui.js                   # UI rendering
│   ├── api.js                  # API routing & fallbacks
│   ├── agents.js               # Multi-agent workflow
│   ├── interview.js            # Voice interview coach
│   ├── resume.js               # Resume analyzer
│   ├── roadmap.js              # Roadmap generation
│   ├── scoring.js              # Employability scoring
│   └── helpers.js              # Utility functions
│
└── docs/
    ├── architecture.md
    ├── deployment.md
    └── product-thinking.md
```

> *If using the hackathon version, all functionality may be bundled into a single HTML, CSS, and JavaScript file while maintaining the same logical architecture.*

---

# ⚙️ System Workflow

```
                   User Opens SheStarts
                            │
                            ▼
                Complete Profile Assessment
                            │
                            ▼
              Resume Analyzer (Optional Auto-Fill)
                            │
                            ▼
             Multi-Agent AI Task Router
                            │
        ┌─────────────┬──────────────┬──────────────┐
        │             │              │
        ▼             ▼              ▼
   Google Gemini   NVIDIA NIM   OpenRouter
        │             │              │
        └─────────────┴──────────────┘
                      │
                      ▼
        Personalized Career Recommendations
                      │
                      ▼
             Skill Gap Analysis
                      │
                      ▼
           Employability Assessment
                      │
                      ▼
            90-Day Learning Roadmap
                      │
                      ▼
        Interview Coach & Career Coach
                      │
                      ▼
         Job Application Assistant
                      │
                      ▼
          Personalized Career Support
```

---

# 🤖 Multi-Agent AI Workflow

Different AI providers are assigned specialized responsibilities to improve response quality, efficiency, and reliability.

| Agent               | AI Model              | Responsibility                        |
| ------------------- | --------------------- | ------------------------------------- |
| Career Match Agent  | Google Gemini         | Personalized career recommendations   |
| Resume Analyzer     | Google Gemini         | Resume parsing and profile generation |
| Skill Coach Agent   | NVIDIA Llama 3.3      | Skill gap analysis                    |
| Readiness Agent     | NVIDIA Llama 3.3      | Employability prediction              |
| Roadmap Agent       | Google Gemini         | Learning roadmap generation           |
| Interview Coach     | OpenRouter (DeepSeek) | Mock interview practice               |
| Career Coach        | OpenRouter (DeepSeek) | Conversational career guidance        |
| Job Assistant       | Google Gemini         | Cover letters and ATS optimization    |
| Risk Analysis Agent | OpenRouter (DeepSeek) | Career transition analysis            |

---

# 📊 Employability Assessment Framework

The platform evaluates users across two complementary dimensions.

### Employability Score

Evaluates objective career readiness using:

* Previous work experience
* Educational background
* Career gap duration
* Market demand
* Skill relevance

### Confidence Score

Evaluates psychological readiness based on:

* Transferable skills
* Learning confidence
* Career motivation
* Communication readiness

These scores provide users with both analytical insights and motivational guidance.

---

# ▶️ Running the Project Locally

### Using Python

```bash
python3 -m http.server 8080
```

Open:

```
http://localhost:8080
```

### Using Node.js

```bash
npx serve .
```

---

# 🔑 API Configuration

The application supports multiple AI providers.

Configure one or more API keys from the **AI Settings** panel.

Supported providers include:

* Google Gemini
* NVIDIA NIM
* OpenRouter

If one provider becomes unavailable, the system automatically switches to an available fallback model, ensuring uninterrupted functionality.

> API keys remain within the active browser session and are never permanently stored.

---

# 🌐 Deployment

SheStarts is a static Single Page Application and requires **no build process**.

Supported hosting platforms include:

* Vercel
* Render
* Netlify
* GitHub Pages
* Firebase Hosting

Deployment can be completed by uploading the project directory directly.

---

# 🎯 Sample User Profile

Use the following example to explore the platform.

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Previous Role | HR Manager                                              |
| Career Gap    | 4–6 Years                                               |
| Career Goal   | Remote Work                                             |
| Study Time    | 2–3 Hours per Day                                       |
| Skills        | Communication, Recruitment, MS Excel, People Management |

---

# 🔮 Future Enhancements

* LinkedIn and Indeed Job API integration
* User authentication and cloud profile synchronization
* AI-powered resume builder
* Personalized certification recommendations
* Career progress tracking dashboard
* Serverless backend for secure API proxying
* Session caching for faster recommendations
* Multilingual support
* Advanced analytics dashboard

---

# 📄 License

This project was developed as an AI-powered career counseling solution to demonstrate intelligent multi-agent workflows, personalized career guidance, and modern frontend architecture.

---

**SheStarts empowers women returning to the workforce with personalized AI guidance, confidence-building tools, and an end-to-end career transition experience.**
