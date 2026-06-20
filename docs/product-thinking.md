# Product Thinking Document – SheStarts AI Career Counselor

## Problem Statement

Women re-entering the workforce after a career break encounter challenges that traditional job portals and career platforms often fail to address. While employment opportunities exist, returnees frequently lack personalized guidance, confidence, and structured career planning.

The primary challenges include:

### 1. Confidence Gap

Extended career breaks often reduce professional confidence despite the presence of valuable transferable skills. Users require objective assessments that highlight their strengths and demonstrate workplace readiness.

### 2. Career Information Gap

Many returners are uncertain about which modern career paths align with their previous experience, the skills currently in demand, and the time investment required to transition successfully.

### 3. Limited Time for Upskilling

Balancing caregiving and household responsibilities leaves little room for lengthy or unfocused learning programs. Users need targeted recommendations that directly support employability.

### 4. Career Break Stigma

Explaining employment gaps remains one of the most challenging aspects of returning to work. Users benefit from structured interview preparation and guidance on confidently presenting their career journey.

### Core Product Insight

The challenge is not a lack of information—it is the absence of **personalized, actionable, and confidence-building career guidance available whenever users need it.**

---

# Key Product Decisions

## 1. Transparent Multi-Agent AI Workflow

To provide specialized assistance, SheStarts implements a **Heterogeneous Multi-Agent Architecture** powered by multiple AI providers, including Google Gemini, NVIDIA NIM, and OpenRouter.

To enhance transparency and user trust, the interface includes:

* A collapsible **AI Settings Panel** displaying provider configuration and API status.
* A real-time **Agent Workflow Panel** indicating which specialist agent and language model is currently processing the request.

This approach enables users to understand how recommendations are generated while improving system reliability through intelligent model routing.

---

## 2. Dual-Dimensional Career Assessment

Rather than relying on a single readiness score, the platform evaluates users across two complementary dimensions:

### Employability Score

An objective assessment based on:

* Professional experience
* Educational background
* Skill relevance
* Career gap duration
* Industry alignment

### Confidence Score

A personalized assessment measuring:

* Self-readiness
* Transferable skills
* Learning mindset
* Emotional preparedness for returning to work

This dual-scoring framework provides both analytical insights and motivational support.

---

## 3. AI Resume Analyzer with Automated Profile Generation

Completing lengthy career questionnaires can be time-consuming.

The Resume Analyzer allows users to upload or paste resume content, which is processed using Google Gemini to automatically populate the multi-step career assessment form. This significantly reduces onboarding time while improving profile accuracy.

---

## 4. AI-Powered Interview Coach

Interview preparation is often the most stressful stage for career returners.

SheStarts includes an interactive AI Interview Coach featuring:

* Voice recognition for spoken responses
* Text-to-speech support
* Mock interview simulations
* Personalized feedback
* Career-gap response practice

This creates a realistic practice environment that helps users improve confidence before real interviews.

---

## 5. Intelligent Job Application Assistant

Beyond career recommendations, the platform assists users throughout the application process by generating:

* Tailored cover letters
* Optimized LinkedIn headlines
* Resume improvement suggestions
* ATS-friendly keyword recommendations based on job descriptions

This bridges the gap between career planning and successful job applications.

---

# Technical Architecture

SheStarts distributes specialized tasks across multiple AI models to maximize performance, reasoning quality, and cost efficiency.

| AI Provider       | Model                       | Primary Responsibilities                                               |
| ----------------- | --------------------------- | ---------------------------------------------------------------------- |
| **Google Gemini** | gemini-2.5-flash            | Career matching, resume parsing, general Q&A, and fast-response tasks  |
| **NVIDIA NIM**    | meta/llama-3.3-70b-instruct | Skill gap analysis, career readiness evaluation, and complex reasoning |
| **OpenRouter**    | deepseek/deepseek-chat      | Conversational coaching, interview assistance, and risk analysis       |

### Intelligent Failover

To ensure uninterrupted service, the platform implements graceful fallback mechanisms. If a provider becomes unavailable or an API key is missing, requests are automatically redirected to Google Gemini, maintaining a seamless user experience.

---

# Future Scalability

The platform has been designed with extensibility and production readiness in mind.

### Session-Level Caching

Frequently requested career analyses can be cached based on common user profiles (e.g., previous role, career gap duration, and region) to reduce latency and API costs.

### Job Platform Integration

Future versions can integrate directly with employment platforms such as LinkedIn and Indeed, enabling personalized recommendations based on active job listings.

### Secure Backend Proxy

For production deployments, API validation and model requests can be routed through serverless backend functions to prevent client-side exposure of API credentials and improve overall security.

---

# Product Vision

SheStarts aims to become an AI-powered career companion for women returning to the workforce by combining personalized career intelligence, transparent AI decision-making, confidence-building tools, and end-to-end job application support within a single, accessible platform.
