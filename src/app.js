/* ══════════════════════════════════════════
   SheStarts – AI Career Counselor
   app.js | Integrated Google Gemini Rest Connector
   ══════════════════════════════════════════ */

'use strict';

// ── State ──────────────────────────────────────────────────────────────
let userData        = {};
let selectedCareer  = null;
let careerRecs      = [];
let skillGapData    = null;
let roadmapData     = null;
let scoreData       = null;
let coachHistory    = [];

// ── Helpers ────────────────────────────────────────────────────────────
function $(id)  { return document.getElementById(id); }
function html(id, content) { $(id).innerHTML = content; }

// Page navigation switcher
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  
  const pg = $('page-' + name);
  if (pg) pg.classList.add('active');
  
  const btn = $('tab-nav-' + name);
  if (btn) btn.classList.add('active');
  
  updateNavIndicator();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (name === 'landing') {
    triggerTypewriter();
    animateStatsCounters();
  } else if (name === 'roadmap' && selectedCareer && !roadmapData) {
    fetchRoadmap();
  }
}

function updateNavIndicator() {
  const activeTab = document.querySelector('.nav-tab.active');
  const indicator = $('nav-indicator');
  const navTabsContainer = document.querySelector('.nav-tabs');
  if (activeTab && indicator && navTabsContainer) {
    if (window.innerWidth > 768) {
      const activeRect = activeTab.getBoundingClientRect();
      const containerRect = navTabsContainer.getBoundingClientRect();
      const leftOffset = activeRect.left - containerRect.left;
      
      indicator.style.display = 'block';
      indicator.style.width = `${activeRect.width}px`;
      indicator.style.transform = `translateX(${leftOffset}px)`;
    } else {
      indicator.style.display = 'none';
    }
  }
}

let typewriterInterval = null;
function triggerTypewriter() {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
  }
  const text = "Personalized career guidance and upskilling roadmaps for women returning to the workforce. Discover high-demand roles matching your background, identify key skill gaps, follow a tailored 90-day study plan, and practice with your personal AI interview coach to restart your career journey with confidence — all in minutes.";
  el.textContent = "";
  let i = 0;
  
  typewriterInterval = setInterval(() => {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
    }
  }, 15);
}

function animateStatsCounters() {
  const animate = (id, target, suffix = '') => {
    const el = $(id);
    if (!el) return;
    let current = 0;
    const duration = 1200; // 1.2s
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;
    
    if (el.dataset.timerId) {
      clearInterval(Number(el.dataset.timerId));
    }
    
    const timerId = setInterval(() => {
      current += increment;
      if (current >= target) {
        clearInterval(timerId);
        el.textContent = target.toLocaleString() + suffix;
        delete el.dataset.timerId;
      } else {
        el.textContent = Math.round(current).toLocaleString() + suffix;
      }
    }, stepTime);
    
    el.dataset.timerId = timerId.toString();
  };
  
  animate('stat-count-women', 2400, '+');
  animate('stat-count-jobs', 87, '%');
  animate('stat-count-paths', 40, '+');
}

// Window listeners for navbar indicator
window.addEventListener('resize', updateNavIndicator);
window.addEventListener('load', async () => {
  setTimeout(() => {
    updateNavIndicator();
    triggerTypewriter();
    animateStatsCounters();
  }, 200);

  // Load all three keys from localStorage
  const savedGemini = localStorage.getItem('gemini_api_key');
  if (savedGemini) {
    userData.apiKey = savedGemini;
    const keyInput = $('f-apikey');
    if (keyInput) keyInput.value = savedGemini;
  }
  const savedNvidia = localStorage.getItem('nvidia_nim_api_key');
  if (savedNvidia) {
    userData.nvidiaKey = savedNvidia;
    const nvidiaInput = $('api-key-nvidia');
    if (nvidiaInput) nvidiaInput.value = savedNvidia;
  }
  const savedOpenRouter = localStorage.getItem('openrouter_api_key');
  if (savedOpenRouter) {
    userData.openRouterKey = savedOpenRouter;
    const openRouterInput = $('api-key-openrouter');
    if (openRouterInput) openRouterInput.value = savedOpenRouter;
  }

  // Attempt to load from env.txt or .env file locally (with cache buster)
  const envFiles = ['env.txt', '.env'];
  
  for (const filename of envFiles) {
    try {
      const response = await fetch(`${filename}?t=` + Date.now());
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n');
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith('GEMINI_API_KEY')) {
            const parts = line.split('=');
            if (parts.length > 1) {
              let val = parts.slice(1).join('=').trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
              }
              val = val.trim();
              if (val && !val.startsWith('YOUR_') && !val.startsWith('your_')) {
                userData.apiKey = val;
                const keyInput = $('f-apikey');
                if (keyInput) keyInput.value = val;
                localStorage.setItem('gemini_api_key', val);
              }
            }
          } else if (line.startsWith('NVIDIA_NIM_API_KEY')) {
            const parts = line.split('=');
            if (parts.length > 1) {
              let val = parts.slice(1).join('=').trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
              }
              val = val.trim();
              if (val && !val.startsWith('YOUR_') && !val.startsWith('your_')) {
                userData.nvidiaKey = val;
                const nvidiaInput = $('api-key-nvidia');
                if (nvidiaInput) nvidiaInput.value = val;
                localStorage.setItem('nvidia_nim_api_key', val);
              }
            }
          } else if (line.startsWith('OPENROUTER_API_KEY')) {
            const parts = line.split('=');
            if (parts.length > 1) {
              let val = parts.slice(1).join('=').trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
              }
              val = val.trim();
              if (val && !val.startsWith('YOUR_') && !val.startsWith('your_')) {
                userData.openRouterKey = val;
                const openRouterInput = $('api-key-openrouter');
                if (openRouterInput) openRouterInput.value = val;
                localStorage.setItem('openrouter_api_key', val);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(`Failed to fetch ${filename}`);
    }
  }

  updateApiStatusBadges();

  // Attach input listeners
  const keyInput = $('f-apikey');
  if (keyInput) {
    keyInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      userData.apiKey = val;
      localStorage.setItem('gemini_api_key', val);
      updateApiStatusBadges();
    });
  }

  const nvidiaInput = $('api-key-nvidia');
  if (nvidiaInput) {
    nvidiaInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      userData.nvidiaKey = val;
      localStorage.setItem('nvidia_nim_api_key', val);
      updateApiStatusBadges();
    });
  }

  const openRouterInput = $('api-key-openrouter');
  if (openRouterInput) {
    openRouterInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      userData.openRouterKey = val;
      localStorage.setItem('openrouter_api_key', val);
      updateApiStatusBadges();
    });
  }


  // Trigger suggestions dynamically when user types in previous role
  const roleInput = $('f-role');
  if (roleInput) {
    roleInput.addEventListener('input', updateSuggestedSkills);
  }
});

function updateApiStatusBadges() {
  const geminiKey = userData.apiKey || '';
  const nvidiaKey = userData.nvidiaKey || '';
  const openRouterKey = userData.openRouterKey || '';

  const statusGemini = $('status-gemini');
  if (statusGemini) {
    if (geminiKey) {
      statusGemini.textContent = 'Active';
      statusGemini.className = 'api-status-badge active';
    } else {
      statusGemini.textContent = 'Missing';
      statusGemini.className = 'api-status-badge missing';
    }
  }

  const statusNvidia = $('status-nvidia');
  if (statusNvidia) {
    if (nvidiaKey) {
      statusNvidia.textContent = 'Active';
      statusNvidia.className = 'api-status-badge active';
    } else {
      statusNvidia.textContent = 'Gemini Fallback';
      statusNvidia.className = 'api-status-badge fallback';
    }
  }

  const statusOpenRouter = $('status-openrouter');
  if (statusOpenRouter) {
    if (openRouterKey) {
      statusOpenRouter.textContent = 'Active';
      statusOpenRouter.className = 'api-status-badge active';
    } else {
      statusOpenRouter.textContent = 'Gemini Fallback';
      statusOpenRouter.className = 'api-status-badge fallback';
    }
  }
}

function toggleSettingsPanel() {
  const body = $('api-settings-body');
  const icon = $('settings-toggle-icon');
  if (body) {
    body.classList.toggle('hidden');
    if (icon) {
      icon.style.transform = body.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
    }
  }
}


function toggleChip(el) {
  el.classList.toggle('selected');
}

function nextStep(n) {
  document.querySelectorAll('.assess-step').forEach(s => s.style.display = 'none');
  const stepDiv = $('assess-step-' + n);
  if (stepDiv) stepDiv.style.display = 'block';
  
  // Stepper Visual Nodes
  for(let i = 1; i <= 4; i++) {
    const stepNode = $('st-' + i);
    if (stepNode) {
      stepNode.classList.remove('active', 'done');
      if (i < n) {
        stepNode.classList.add('done');
      } else if (i === n) {
        stepNode.classList.add('active');
      }
    }
  }
  
  // Stepper Progress Line fill width (0%, 33.3%, 66.6%, 100%)
  const progressLine = $('stepper-progress-line');
  if (progressLine) {
    const pct = ((n - 1) / 3) * 100;
    document.documentElement.style.setProperty('--stepper-progress-width', `${pct}%`);
  }

  // Trigger suggested skills when entering step 3
  if (n === 3) {
    updateSuggestedSkills();
  }

  if (n === 4) {
    updateConfirmSummary();
  }
}

function jumpToStep(n) {
  // Allow jumping to any step directly
  nextStep(n);
}

// ── Resume AI Auto-Fill Parser ──────────────────────────────────────────
function togglePasteArea() {
  const pasteBox = $('paste-resume-box');
  if (pasteBox) {
    pasteBox.classList.toggle('hidden');
  }
}

function handleResumeUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    $('resume-paste-text').value = text;
    togglePasteArea();
    parseResumeText();
  };
  reader.readAsText(file);
}

async function parseResumeText() {
  const textContent = $('resume-paste-text').value.trim();
  if (!textContent) {
    alert("Please paste your resume text first.");
    return;
  }

  const apiKey = ($('f-apikey') ? $('f-apikey').value.trim() : '') || userData.apiKey || localStorage.getItem('gemini_api_key') || '';
  if (!apiKey) {
    const enteredKey = prompt('Gemini API Key is missing. Please paste your Google Gemini API Key here (it will be saved to your browser cache):');
    if (enteredKey && enteredKey.trim()) {
      const trimmed = enteredKey.trim();
      userData.apiKey = trimmed;
      localStorage.setItem('gemini_api_key', trimmed);
      const keyInput = $('f-apikey');
      if (keyInput) {
        keyInput.value = trimmed;
      }
      parseResumeText();
    }
    return;
  }

  loading('parse-loading', true);
  $('btn-parse-resume').disabled = true;

  const apiPrompt = `Parse this resume/bio text and extract matching values for our questionnaire fields. 
Return the output STRICTLY as a raw JSON block with the following keys and constraints:
- "name": String (full name)
- "previousRole": String (primary job title / role, e.g. "HR Recruiter", "QA Engineer")
- "breakDuration": String (MUST match exactly one of: 'Less than 1 year', '1–3 years', '3–5 years', '5–7 years', 'More than 7 years')
- "highestEducation": String (MUST match exactly one of: "Bachelor's degree", "Master's degree", "Diploma / certificate", "PhD", "High school")
- "targetCountry": String (MUST match exactly one of: "India", "United States", "United Kingdom", "Canada", "United Arab Emirates")
- "workPreference": String (MUST match exactly one of: "Remote", "Hybrid", "In-office")
- "hoursDaily": String (MUST match exactly one of: 'Less than 1 hour', '2–3 hours', '3–5 hours', 'Full-time (6+)')
- "studyMajor": String (e.g. "Computer Science", "Human Resources", "Commerce")
- "skills": Array of strings (3 to 6 key professional skills extracted or related, e.g. ["Recruiting", "Sourcing", "Communication"])

Resume text to parse:
"""
${textContent}
"""
`;

  try {
    const rawResult = await callGemini(apiPrompt, "You are a precise data extractor. Return ONLY valid JSON matching the exact schema.");
    const parsed = parseJSON(rawResult);

    if (parsed) {
      if (parsed.name) $('f-name').value = parsed.name;
      if (parsed.previousRole) {
        $('f-role').value = parsed.previousRole;
        updateSuggestedSkills();
      }
      if (parsed.breakDuration) $('f-gap').value = parsed.breakDuration;
      if (parsed.highestEducation) $('f-edu').value = parsed.highestEducation;
      if (parsed.targetCountry) $('f-country').value = parsed.targetCountry;
      if (parsed.studyMajor) $('f-field').value = parsed.studyMajor;
      
      if (parsed.workPreference) {
        document.querySelectorAll('#f-work-pref .chip').forEach(c => {
          c.classList.toggle('selected', c.textContent.toLowerCase() === parsed.workPreference.toLowerCase());
        });
      }

      if (parsed.hoursDaily) $('f-hours').value = parsed.hoursDaily;

      if (parsed.skills && Array.isArray(parsed.skills)) {
        // Toggle selected skills in general list
        document.querySelectorAll('#f-skills-chips .chip').forEach(c => {
          const matched = parsed.skills.some(sk => sk.toLowerCase().includes(c.textContent.toLowerCase()) || c.textContent.toLowerCase().includes(sk.toLowerCase()));
          c.classList.toggle('selected', matched);
        });
      }

      alert("Gemini successfully analyzed your resume and filled the fields! Please review the entries.");
      nextStep(1); // Refresh step 1 display
    }
  } catch (err) {
    alert("Error parsing resume with Gemini: " + err.message);
  } finally {
    loading('parse-loading', false);
    $('btn-parse-resume').disabled = false;
  }
}

// ── Dynamic Skills Suggestion ───────────────────────────────────────────
function updateSuggestedSkills() {
  const role = ($('f-role').value || '').trim().toLowerCase();
  const dynamicContainer = $('f-dynamic-skills');
  const badge = $('role-detected-badge');
  if (!dynamicContainer) return;

  if (!role) {
    dynamicContainer.innerHTML = '<span style="font-size: 12px; color: var(--color-text-secondary); width:100%; display:block; text-align:center;">Type your role in Step 1 to load custom recommendations here.</span>';
    if (badge) badge.textContent = "No role yet";
    return;
  }

  if (badge) badge.textContent = $('f-role').value.trim();

  // Static Offline Suggestions Map for common roles
  const suggestionsMap = {
    'hr': ['Recruiting', 'Onboarding', 'Team Management', 'Excel / Sheets', 'Communication', 'Payroll Management', 'Sourcing'],
    'human resources': ['Recruiting', 'Onboarding', 'Team Management', 'Excel / Sheets', 'Communication', 'Conflict Resolution', 'Sourcing'],
    'recruiter': ['Recruiting', 'Onboarding', 'Communication', 'Sourcing', 'Interviewing', 'Excel / Sheets'],
    'developer': ['HTML / CSS', 'JavaScript', 'React', 'Node.js', 'Git / GitHub', 'SQL', 'Coding', 'Problem Solving'],
    'engineer': ['JavaScript', 'HTML / CSS', 'React', 'Git / GitHub', 'SQL', 'Python', 'System Design', 'Writing'],
    'coder': ['HTML / CSS', 'JavaScript', 'React', 'Node.js', 'Git / GitHub', 'SQL'],
    'programmer': ['HTML / CSS', 'JavaScript', 'React', 'Node.js', 'Git / GitHub', 'SQL'],
    'analyst': ['Excel / Sheets', 'SQL', 'Tableau / PowerBI', 'Python', 'Writing', 'Research', 'Analytics'],
    'data': ['Excel / Sheets', 'SQL', 'Tableau / PowerBI', 'Python', 'R Language', 'Data Cleaning'],
    'manager': ['Team Management', 'Project Mgmt', 'Agile / Scrum', 'Budgeting', 'Communication', 'Jira'],
    'product': ['Product Strategy', 'Jira', 'Agile / Scrum', 'Project Mgmt', 'User Research', 'Writing'],
    'designer': ['UX / UI Design', 'Figma', 'User Research', 'HTML / CSS', 'Communication', 'Wireframing'],
    'ux': ['UX / UI Design', 'Figma', 'User Research', 'Communication', 'Wireframing'],
    'writer': ['Writing', 'SEO', 'Content Strategy', 'Social Media', 'Communication', 'WordPress'],
    'content': ['Writing', 'SEO', 'Content Strategy', 'Social Media', 'Communication', 'WordPress'],
    'teacher': ['Communication', 'Presentation', 'Lesson Planning', 'Instruction', 'LMS Platforms'],
    'educator': ['Communication', 'Presentation', 'Lesson Planning', 'Instruction', 'LMS Platforms'],
    'admin': ['Excel / Sheets', 'Data Entry', 'Scheduling', 'Communication', 'Organization', 'Writing'],
    'support': ['Customer Service', 'Communication', 'Problem Solving', 'Excel / Sheets', 'Ticketing Systems']
  };

  // Find matching skills
  let foundSkills = [];
  for (const [key, val] of Object.entries(suggestionsMap)) {
    if (role.includes(key)) {
      foundSkills = val;
      break;
    }
  }

  // Fallback default skills if no match
  if (foundSkills.length === 0) {
    foundSkills = ['Communication', 'Excel / Sheets', 'Project Mgmt', 'Team Management', 'Writing', 'Customer Service'];
  }

  dynamicContainer.innerHTML = '';
  foundSkills.forEach(skill => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = skill;
    chip.onclick = function() {
      // Toggle selection and sync with main list if applicable
      chip.classList.toggle('selected');
      syncSuggestedSkillWithMainList(skill, chip.classList.contains('selected'));
    };
    
    // Pre-check if already selected in main list
    const mainListChips = Array.from(document.querySelectorAll('#f-skills-chips .chip'));
    const isAlreadySelected = mainListChips.some(c => c.textContent.toLowerCase() === skill.toLowerCase() && c.classList.contains('selected'));
    if (isAlreadySelected) {
      chip.classList.add('selected');
    }

    dynamicContainer.appendChild(chip);
  });
}

function syncSuggestedSkillWithMainList(skillName, isSelected) {
  // Find in main list and sync status
  document.querySelectorAll('#f-skills-chips .chip').forEach(c => {
    if (c.textContent.toLowerCase() === skillName.toLowerCase()) {
      c.classList.toggle('selected', isSelected);
    }
  });
}

function updateConfirmSummary() {
  const name = $('f-name').value.trim() || 'there';
  const role = $('f-role').value.trim() || 'No previous role specified';
  const gap = $('f-gap').value;
  const workPref = Array.from(document.querySelectorAll('#f-work-pref .chip.selected')).map(c => c.textContent).join(', ') || 'Remote';
  const timeline = $('f-timeline').value;
  const hours = $('f-hours').value;

  html('confirm-profile-details', `${name} · ${role} (${gap} break)`);
  html('confirm-goal-details', `${workPref} work · Target income: ${timeline}`);
  html('confirm-budget-details', `${hours} per day study budget`);
}

function launchSampleUserDemo() {
  $('f-name').value = "Priya Sharma";
  $('f-role').value = "HR Specialist";
  $('f-gap').value = "5–7 years";
  $('f-edu').value = "Bachelor's degree";
  $('f-field').value = "Human Resources";
  $('f-country').value = "India";
  $('f-hours').value = "2–3 hours";
  $('f-timeline').value = "Within 3 months";
  
  // Prefill chips
  document.querySelectorAll('#f-work-pref .chip').forEach(c => {
    c.classList.toggle('selected', c.textContent === 'Remote');
  });
  
  document.querySelectorAll('#f-skills-chips .chip').forEach(c => {
    const isPriyaSkill = ['Communication', 'Team Management', 'Recruiting', 'Onboarding'].includes(c.textContent);
    c.classList.toggle('selected', isPriyaSkill);
  });

  showPage('assessment');
  nextStep(1);
}

function loading(id, show) {
  const el = $(id);
  if (el) el.classList.toggle('hidden', !show);
}

// ══════════════════════════════════════════
// AI PROVIDERS & MULTI-AGENT ROUTER
// ══════════════════════════════════════════
async function callGemini(promptText, systemInstruction = '', model = 'gemini-3.5-flash') {
  const apiKey = ($('f-apikey') ? $('f-apikey').value.trim() : '') || userData.apiKey || localStorage.getItem('gemini_api_key') || '';
  if (!apiKey) throw new Error('No API key provided. Please configure your Google Gemini API Key first.');

  const models = [model, 'gemini-3.5-flash', 'gemini-3.1-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: 'application/json' }
      };
      if (systemInstruction) {
        requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
      }
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${resp.status}`);
      }
      const data = await resp.json();
      try { return data.candidates[0].content.parts[0].text; }
      catch (e) { throw new Error('Failed to parse Gemini response.'); }
    } catch (e) {
      console.warn(`[${m}] failed: ${e.message}`);
      lastError = e;
    }
  }
  throw lastError || new Error('Failed to communicate with Gemini models.');
}


async function callNvidiaNIM(promptText, systemInstruction = '', model = 'meta/llama-3.3-70b-instruct') {
  const apiKey = ($('api-key-nvidia') ? $('api-key-nvidia').value.trim() : '') || userData.nvidiaKey || localStorage.getItem('nvidia_nim_api_key') || '';
  if (!apiKey) throw new Error('No NVIDIA NIM API key configured.');

  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: promptText });

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `NVIDIA NIM error ${resp.status}`);
  }

  const data = await resp.json();
  try {
    return data.choices[0].message.content;
  } catch (e) {
    throw new Error('Failed to extract message from NVIDIA NIM response.');
  }
}

async function callOpenRouter(promptText, systemInstruction = '', model = 'deepseek/deepseek-chat') {
  const apiKey = ($('api-key-openrouter') ? $('api-key-openrouter').value.trim() : '') || userData.openRouterKey || localStorage.getItem('openrouter_api_key') || '';
  if (!apiKey) throw new Error('No OpenRouter API key configured.');

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: promptText });

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/skbha/shestarts',
      'X-Title': 'SheStarts'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter error ${resp.status}`);
  }

  const data = await resp.json();
  try {
    return data.choices[0].message.content;
  } catch (e) {
    throw new Error('Failed to extract message from OpenRouter response.');
  }
}

async function callAgentLLM(agentNum, agentName, promptText, systemInstruction) {
  let provider = 'gemini';
  let model = 'gemini-3.5-flash';

  // Determine primary provider/model configurations
  if (agentName === 'SkillCoachAgent' || agentName === 'JobReadinessAgent') {
    provider = 'nvidia';
    model = 'meta/llama-3.3-70b-instruct';
  } else if (agentName === 'RoadmapPlannerAgent') {
    provider = 'openrouter';
    model = 'meta-llama/llama-3-8b-instruct:free';
  } else if (agentName === 'InterviewCoachAgent' || agentName === 'CareerRiskAgent') {
    provider = 'openrouter';
    model = 'deepseek/deepseek-chat';
  }

  // Update status in the Agent panel UI if sequential run
  if (agentNum) {
    setAgentState(agentNum, 'running', `Running on ${provider} (${model})...`);
  }

  // 1. Attempt to call Vercel Serverless proxy (secure, hides keys on production)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        model,
        promptText,
        systemInstruction
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.content) {
        return data.content;
      }
    } else {
      console.warn(`Vercel Serverless proxy returned status ${response.status}. Falling back to browser direct fetch.`);
    }
  } catch (err) {
    console.log(`Vercel Serverless proxy unavailable (normal for local runs): ${err.message}. Falling back to browser direct fetch.`);
  }

  // 2. Fall back to browser-based direct fetch if proxy fails or runs locally
  const hasGemini = !!(($('f-apikey') ? $('f-apikey').value.trim() : '') || userData.apiKey || localStorage.getItem('gemini_api_key'));
  const hasNvidia = !!(($('api-key-nvidia') ? $('api-key-nvidia').value.trim() : '') || userData.nvidiaKey || localStorage.getItem('nvidia_nim_api_key'));
  const hasOpenRouter = !!(($('api-key-openrouter') ? $('api-key-openrouter').value.trim() : '') || userData.openRouterKey || localStorage.getItem('openrouter_api_key'));

  let activeProvider = provider;
  let activeModel = model;

  if (provider === 'nvidia' && !hasNvidia) {
    activeProvider = 'gemini';
    activeModel = 'gemini-3.5-flash';
  } else if (provider === 'openrouter' && !hasOpenRouter) {
    activeProvider = 'gemini';
    activeModel = 'gemini-3.5-flash';
  }

  // Update status in UI for fallback state
  if (agentNum) {
    const displayLabel = activeProvider === provider ? `${activeProvider} (${activeModel})` : `Gemini Fallback`;
    setAgentState(agentNum, 'running', `Running on ${displayLabel}...`);
  }

  try {
    if (activeProvider === 'nvidia') {
      return await callNvidiaNIM(promptText, systemInstruction, activeModel);
    } else if (activeProvider === 'openrouter') {
      return await callOpenRouter(promptText, systemInstruction, activeModel);
    } else {
      return await callGemini(promptText, systemInstruction, activeModel);
    }
  } catch (err) {
    console.warn(`Primary provider ${activeProvider} failed for ${agentName}: ${err.message}. Retrying with Gemini Fallback.`);
    if (activeProvider !== 'gemini' && hasGemini) {
      if (agentNum) {
        setAgentState(agentNum, 'running', `Retrying on Gemini Fallback...`);
      }
      return await callGemini(promptText, systemInstruction, 'gemini-3.5-flash');
    }
    throw err;
  }
}




// ══════════════════════════════════════════
// MULTI-AGENT SYSTEM — 5 Specialist Agents
// ══════════════════════════════════════════
function setAgentState(num, state, statusText) {
  const row = $('agent-' + num);
  const statusEl = $('agent-' + num + '-status');
  if (!row) return;
  row.className = 'agent-row ' + state;
  if (statusEl) statusEl.textContent = statusText;
}

async function ProfileAnalystAgent(profileData) {
  // Agent 1: Validates and summarizes user profile
  return profileData; // profile already collected from form; agent confirms it
}

async function CareerResearchAgent(profile) {
  const p = `Analyze this woman's career profile and recommend 3 suitable career paths.
Return ONLY valid JSON. Calibrate salaries for country: ${profile.country}.

Profile:
- Name: ${profile.name}
- Education: ${profile.edu} in ${profile.field}
- Previous role: ${profile.role}
- Experience gap: ${profile.gap}
- Current skills: ${profile.skills}
- Work preference: ${profile.workPref}
- Study hours/day: ${profile.hours}
- Target timeline: ${profile.timeline}
- Target country: ${profile.country}

Return this exact JSON:
{
  "careers": [
    { "title": "career title", "why": "2-sentence reasoning", "effort": "Low|Medium|High", "timeToReady": "e.g. 6–8 weeks", "salaryRange": "calibrated to country", "matchPct": 92 }
  ]
}`;
  const raw = await callAgentLLM(2, 'CareerResearchAgent', p, 'You are an expert career counselor for women restarting careers. Be warm and encouraging. Respond only in JSON.');
  return parseJSON(raw);
}

async function SkillCoachAgent(career, userSkills, userRole, userGap) {
  const p = `Perform a skill gap analysis for this career transition. Return ONLY valid JSON.

Target career: ${career.title}
Current skills: ${userSkills}
Background: ${userRole} with ${userGap} career break.

Return this exact JSON shape:
{
  "skills": [ { "name": "skill name", "pct": 90, "colorClass": "fill-green|fill-amber|fill-red" } ],
  "priorityGaps": [ { "title": "gap title", "description": "how to bridge this gap" } ],
  "employabilityScore": 75,
  "confidenceScore": 70,
  "confidenceDesc": "1-sentence encouraging assessment of her readiness and confidence for this transition",
  "transitionRisks": "1-sentence market risk"
}`;
  const raw = await callAgentLLM(3, 'SkillCoachAgent', p, 'You are an expert HR analyst and career coach. Be constructive and encouraging. Respond only in JSON.');
  return parseJSON(raw);
}

async function RoadmapPlannerAgent(career, hours) {
  const p = `Create a 30-60-90 day week-by-week learning roadmap. Return ONLY valid JSON.

Career target: ${career.title}
Study budget: ${hours}/day.

Return:
{
  "rm30": [ { "week": "Week 1 — Title", "focus": "focus area", "tasks": ["task 1", "task 2"] } ],
  "rm60": [ { "week": "Week 5–6 — Title", "focus": "focus area", "tasks": ["task 1", "task 2"] } ],
  "rm90": [ { "week": "Week 9–10 — Title", "focus": "focus area", "tasks": ["task 1", "task 2"] } ]
}`;
  const raw = await callAgentLLM(4, 'RoadmapPlannerAgent', p, 'You are an education learning strategist. Respond only in JSON.');
  return parseJSON(raw);
}

async function InterviewCoachAgent(career, history) {
  const p = `You are SheStarts AI Career Coach. Answer the candidate's message based on goal: ${career ? career.title : 'career restart'}.

Prior conversation:
${history.map(m => `${m.role === 'assistant' ? 'Coach' : 'Candidate'}: ${m.text}`).join('\n')}

Return ONLY valid JSON:
{ "reply": "your encouraging, practical reply (max 3 sentences)" }`;
  const raw = await callAgentLLM(5, 'InterviewCoachAgent', p, 'You are a warm, helpful AI Career Coach for women returners. Respond only in JSON.');
  return parseJSON(raw);
}

async function GeneralBotAgent(message, history) {
  const p = `You are SheStarts AI assistant helping women restart their careers.

Conversation:
${history.map(m => `${m.role}: ${m.text}`).join('\n')}
User: ${message}

Return ONLY valid JSON:
{ "reply": "helpful, warm, encouraging reply (max 3 sentences)" }`;
  const raw = await callAgentLLM(null, 'GeneralBotAgent', p, 'You are a warm helpful career guidance assistant for women returners. Respond only in JSON.');
  return parseJSON(raw);
}

async function JobApplicationAgent(jd, userProfile) {
  const p = `You are a professional career coach and resume writer. Help this woman apply for the job.

Her Profile:
- Name: ${userProfile.name || 'Candidate'}
- Previous role: ${userProfile.role || 'Professional'}
- Target career: ${userProfile.selectedCareer || 'this role'}
- Skills: ${userProfile.skills || 'various skills'}
- Career gap: ${userProfile.gap || 'career break'}

Job Description:
${jd}

Return ONLY valid JSON:
{
  "coverLetter": "Professional 3-paragraph cover letter tailored to this JD",
  "linkedinHeadline": "Compelling LinkedIn headline (max 120 chars)",
  "topKeywords": "5-7 resume keywords from the JD separated by commas",
  "applicationStrategy": "3 specific tips on how to position herself for this role given her background"
}`;
  const raw = await callAgentLLM(null, 'JobApplicationAgent', p, 'You are an expert career coach and professional writer. Respond only in JSON.');
  return parseJSON(raw);
}

async function JobReadinessAgent(career, userData, employabilityScore) {
  const p = `Predict job readiness for this woman's career transition. Return ONLY valid JSON.

Target career: ${career.title}
Current skills: ${userData.skills}
Previous role: ${userData.role}
Career gap: ${userData.gap}
Study hours/day: ${userData.hours}
Target timeline: ${userData.timeline}
Employability score: ${employabilityScore}/100
Country: ${userData.country}

Return this exact JSON shape:
{
  "placementProbability": 78,
  "estimatedTimeline": "8-10 weeks",
  "readinessLevel": "Moderately Ready",
  "nextSteps": [
    "Step 1 description - what to do immediately",
    "Step 2 description - what to do next",
    "Step 3 description - final preparation"
  ]
}`;
  const raw = await callAgentLLM(6, 'JobReadinessAgent', p, 'You are a job market analyst specializing in women career returners. Be realistic but encouraging. Respond only in JSON.');
  return parseJSON(raw);
}

async function CareerRiskAgent(career, userData) {
  const p = `Analyze career transition risks for this woman. Return ONLY valid JSON.

Target career: ${career.title}
Previous role: ${userData.role}
Career gap: ${userData.gap}
Current skills: ${userData.skills}
Country: ${userData.country}

Return this exact JSON shape:
{
  "overallRiskLevel": 35,
  "riskLevelLabel": "Low-Medium",
  "risks": [
    {
      "title": "risk title",
      "description": "1-sentence risk description",
      "severity": "Low|Medium|High",
      "mitigator": "1-sentence mitigation strategy"
    }
  ]
}`;
  const raw = await callAgentLLM(7, 'CareerRiskAgent', p, 'You are a career risk analyst. Be honest but constructive. Respond only in JSON.');
  return parseJSON(raw);
}

function parseJSON(raw) {
  let cleaned = raw.trim();
  // Strip markdown code block wrappers if present
  if (cleaned.startsWith('```')) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
    }
  }
  
  // Secondary check to find valid JSON bounds
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const startIdx = (firstBrace !== -1 && firstBracket !== -1) ? Math.min(firstBrace, firstBracket) : (firstBrace !== -1 ? firstBrace : firstBracket);
  
  if (startIdx !== -1) {
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);
    if (endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
  }

  return JSON.parse(cleaned);
}

// ══════════════════════════════════════════
// STEP 4 – Execute Profile Analysis & Career recommendations
// ══════════════════════════════════════════
async function runAnalysis() {
  const name     = $('f-name').value.trim()     || 'there';
  const role     = $('f-role').value.trim()     || 'various roles';
  const gap      = $('f-gap').value;
  const edu      = $('f-edu').value;
  const field    = $('f-field').value.trim()    || 'general';
  const country  = $('f-country').value;
  const hours    = $('f-hours').value;
  const timeline = $('f-timeline').value;
  
  const apiKey = ($('f-apikey') ? $('f-apikey').value.trim() : '') || userData.apiKey || localStorage.getItem('gemini_api_key') || '';

  const workPref = Array.from(document.querySelectorAll('#f-work-pref .chip.selected')).map(c => c.textContent).join(', ');
  const skills = Array.from(document.querySelectorAll('#f-skills-chips .chip.selected')).map(c => c.textContent).join(', ');

  if (!apiKey) {
    const enteredKey = prompt('Gemini API Key is missing. Please paste your Google Gemini API Key here (it will be saved to your browser cache for next time):');
    if (enteredKey && enteredKey.trim()) {
      const trimmed = enteredKey.trim();
      userData.apiKey = trimmed;
      localStorage.setItem('gemini_api_key', trimmed);
      const keyInput = $('f-apikey');
      if (keyInput) {
        keyInput.value = trimmed;
      }
      // Re-trigger the analysis automatically with the new key!
      runAnalysis();
    }
    return;
  }

  userData = { name, role, gap, edu, field, country, workPref, skills, hours, timeline, apiKey };

  $('btn-run-analysis').disabled = true;
  loading('analyze-loading', true);

  // Show agent panel
  const panel = $('agent-panel');
  if (panel) panel.style.display = 'block';

  try {
    // Agent 1: Profile Analyst
    setAgentState(1, 'running', 'Analyzing profile...');
    await ProfileAnalystAgent(userData);
    setAgentState(1, 'done', '✓ Profile analyzed');

    // Agent 2: Career Research
    setAgentState(2, 'running', 'Searching career matches...');
    const careerData = await CareerResearchAgent(userData);
    careerRecs = careerData.careers;
    setAgentState(2, 'done', '✓ Careers found');

    // Agents 3-7 will run after career selection
    setAgentState(3, 'waiting', 'Waiting for career selection...');
    setAgentState(4, 'waiting', 'Waiting for career selection...');
    setAgentState(5, 'waiting', 'Ready on Dashboard');
    setAgentState(6, 'waiting', 'Waiting...');
    setAgentState(7, 'waiting', 'Waiting...');

    renderCareers();
    showPage('careers');
  } catch (e) {
    alert('Something went wrong: ' + e.message);
  } finally {
    $('btn-run-analysis').disabled = false;
    loading('analyze-loading', false);
  }
}

function renderCareers() {
  const container = $('careers-output') || $('careers-container');
  if (!container) return;

  let out = '';
  careerRecs.forEach((c, i) => {
    const bestClass = i === 0 ? 'best' : '';
    const badge = i === 0 ? `<span class="rec-badge">Best Match · ${c.matchPct}%</span>` : `<span class="rec-badge" style="background:#4B5563;">Match · ${c.matchPct}%</span>`;
    
    out += `
    <div class="rec-card ${bestClass}" id="rec-card-${i}" onclick="selectCareer(${i})">
      ${badge}
      <div class="rec-role">${c.title}</div>
      <p class="rec-why">${c.why}</p>
      <div class="rec-meta">
        <span class="meta-chip">⏱ ${c.timeToReady}</span>
        <span class="meta-chip">${c.salaryRange}</span>
        <span class="meta-chip">${c.effort} effort</span>
      </div>
    </div>`;
  });

  container.innerHTML = out;
}

async function selectCareer(i) {
  document.querySelectorAll('.rec-card').forEach((el, j) => {
    el.classList.toggle('selected', j === i);
  });
  selectedCareer = careerRecs[i];
  
  $('skill-gap-section-container').classList.remove('hidden');
  $('skill-gap-title').textContent = `Skill Gap Analysis — ${selectedCareer.title}`;
  
  await fetchSkillGap();
}

// ══════════════════════════════════════════
// Skill Gap Analysis API
// ══════════════════════════════════════════
async function fetchSkillGap() {
  const barsContainer = $('skill-bars-list');
  const priorityGapsContainer = $('priority-gaps-list');
  
  barsContainer.innerHTML = '<p style="font-size:12px;">SkillCoachAgent analyzing skill metrics...</p>';
  priorityGapsContainer.innerHTML = '';

  // Agent 3: Skill Coach
  setAgentState(3, 'running', 'Analyzing skill gaps...');

  try {
    skillGapData = await SkillCoachAgent(selectedCareer, userData.skills, userData.role, userData.gap);
    setAgentState(3, 'done', '✓ Gap analysis complete');

    // Render Bars
    let barsOut = '';
    skillGapData.skills.forEach(s => {
      barsOut += `
      <div class="skill-row">
        <div class="skill-label-row"><span class="skill-name">${s.name}</span><span class="skill-pct">${s.pct}%</span></div>
        <div class="skill-track"><div class="skill-fill ${s.colorClass}" style="width:${s.pct}%"></div></div>
      </div>`;
    });
    barsContainer.innerHTML = barsOut;

    // Render priority gaps
    let gapsOut = '';
    skillGapData.priorityGaps.forEach(g => {
      gapsOut += `
      <div class="gap-card">
        <div class="gap-content">
          <h4>${g.title}</h4>
          <p>${g.description}</p>
        </div>
      </div>`;
    });
    priorityGapsContainer.innerHTML = gapsOut;

    // Prefill dashboard state
    $('dash-score-val').textContent = skillGapData.employabilityScore;
    $('dashboard-score-text').textContent = skillGapData.employabilityScore;
    $('dash-skills-val').textContent = userData.skills.split(',').length;
    $('dash-gaps-val').textContent = skillGapData.priorityGaps.length;
    
    // Calculate circular SVG dashoffset
    const offset = 452 - (452 * skillGapData.employabilityScore) / 100;
    $('dashboard-score-circle').setAttribute('stroke-dashoffset', offset);

    // Confidence Score
    const confScore = skillGapData.confidenceScore || Math.round(skillGapData.employabilityScore * 0.9);
    const confDesc = skillGapData.confidenceDesc || `You are showing strong readiness for the ${selectedCareer.title} transition!`;
    const confOffset = 201 - (201 * confScore / 100);
    const confCard = $('confidence-card');
    if (confCard) {
      confCard.style.display = 'flex';
      $('confidence-score-num').textContent = confScore;
      $('confidence-desc').textContent = confDesc;
      $('confidence-circle').setAttribute('stroke-dashoffset', confOffset);
    }

    // Show Job Application Assistant
    const jobBox = $('job-assist-box');
    if (jobBox) jobBox.style.display = 'block';

    // Agent 5: Interview Coach
    setAgentState(5, 'running', 'Activating on Dashboard...');
    initAICoach();
    setAgentState(5, 'done', '✓ Coach ready on Dashboard');

    // Agent 6: Job Readiness Predictor
    setAgentState(6, 'running', 'Predicting job readiness...');
    try {
      const readinessData = await JobReadinessAgent(selectedCareer, userData, skillGapData.employabilityScore);
      setAgentState(6, 'done', '✓ Readiness predicted');

      const readinessCard = $('readiness-card');
      if (readinessCard) {
        readinessCard.style.display = 'block';
        $('readiness-probability').textContent = readinessData.placementProbability + '%';
        $('readiness-timeline').textContent = readinessData.estimatedTimeline;
        $('readiness-level').textContent = readinessData.readinessLevel;

        let stepsHtml = '';
        if (readinessData.nextSteps) {
          readinessData.nextSteps.forEach((step, i) => {
            stepsHtml += `<div class="readiness-step"><div class="readiness-step-num">${i + 1}</div><div>${step}</div></div>`;
          });
        }
        $('readiness-steps').innerHTML = stepsHtml;
      }
    } catch (e) {
      console.warn('JobReadinessAgent error:', e.message);
      setAgentState(6, 'waiting', '✗ Error');
    }

    // Agent 7: Career Risk Analyst
    setAgentState(7, 'running', 'Analyzing career risks...');
    try {
      const riskData = await CareerRiskAgent(selectedCareer, userData);
      setAgentState(7, 'done', '✓ Risks analyzed');

      const riskCard = $('risk-analysis-card');
      if (riskCard) {
        riskCard.style.display = 'block';
        const riskLevel = riskData.overallRiskLevel || 35;
        $('risk-fill').style.width = riskLevel + '%';
        $('risk-level-text').textContent = riskData.riskLevelLabel || 'Moderate';

        let risksHtml = '';
        if (riskData.risks) {
          const sevIcons = { 'Low': '🟢', 'Medium': '🟡', 'High': '🔴' };
          riskData.risks.forEach(r => {
            risksHtml += `
              <div class="risk-item">
                <div class="risk-item-icon">${sevIcons[r.severity] || '🟡'}</div>
                <div class="risk-item-content">
                  <h5>${r.title}</h5>
                  <p>${r.description}</p>
                  <div class="risk-mitigator">✅ Mitigator: ${r.mitigator}</div>
                </div>
              </div>`;
          });
        }
        $('risk-items-list').innerHTML = risksHtml;
      }
    } catch (e) {
      console.warn('CareerRiskAgent error:', e.message);
      setAgentState(7, 'waiting', '✗ Error');
    }

    // Agent 4 status update
    setAgentState(4, 'waiting', 'Will run when you view Roadmap');
  } catch (e) {
    barsContainer.innerHTML = `<p style="color:var(--color-red);">Error: ${e.message}</p>`;
    setAgentState(3, 'waiting', '✗ Error occurred');
  }
}

// ══════════════════════════════════════════
// 30-60-90 Roadmap Engine
// ══════════════════════════════════════════
async function fetchRoadmap() {
  const container = $('roadmap-container-all');
  container.innerHTML = '<p>RoadmapPlannerAgent building learning roadmap...</p>';

  // Agent 4: Roadmap Planner
  setAgentState(4, 'running', 'Building roadmap...');

  try {
    roadmapData = await RoadmapPlannerAgent(selectedCareer, userData.hours);
    setAgentState(4, 'done', '✓ Roadmap generated');
    renderRoadmapContent();
  } catch (e) {
    container.innerHTML = `<p style="color:var(--color-red);">Error loading roadmap: ${e.message}</p>`;
    setAgentState(4, 'waiting', '✗ Error');
  }
}

function renderRoadmapContent() {
  const container = $('roadmap-container-all');
  if (!roadmapData) return;

  $('roadmap-path-pill').textContent = `${selectedCareer.title} Path`;
  $('roadmap-hours-subtitle').textContent = `Studying ${userData.hours}/day.`;

  let out = '';
  const tabs = ['30', '60', '90'];

  tabs.forEach(t => {
    const phaseKey = 'rm' + t;
    const activeClass = t === '30' ? 'active' : '';
    
    out += `<div id="rm-${t}" class="rm-content ${activeClass}">`;
    roadmapData[phaseKey].forEach(w => {
      let tasksOut = '';
      w.tasks.forEach(task => {
        tasksOut += `<div class="rm-task"><div class="rm-dot"></div><div>${task}</div></div>`;
      });
      out += `
      <div class="rm-week">
        <div class="rm-week-header"><span>${w.week}</span><small>${w.focus}</small></div>
        <div class="rm-week-body">
          ${tasksOut}
        </div>
      </div>`;
    });
    out += `</div>`;
  });

  container.innerHTML = out;
}

window.switchRoadmapTab = function(day) {
  document.querySelectorAll('.rm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.rm-content').forEach(c => c.classList.remove('active'));
  
  const activeTabBtn = $('btn-rm-' + day);
  if (activeTabBtn) activeTabBtn.classList.add('active');
  
  const content = $('rm-' + day);
  if (content) content.classList.add('active');
};

// ══════════════════════════════════════════
// AI Career Coach
// ══════════════════════════════════════════
function initAICoach() {
  $('dashboard-user-name').textContent = `${userData.name}'s Career Dashboard`;
  coachHistory = [
    {
      role: 'assistant',
      text: `Hi ${userData.name}! You are starting your journey to become a **${selectedCareer.title}**. Your current employability score is **${$('dash-score-val').textContent}/100**. How can I help you today? Ask me about SQL practice, resume optimization, or job application tips!`
    }
  ];
  renderCoachMessages();
}

function renderCoachMessages() {
  const wrap = $('chat-messages-container');
  wrap.innerHTML = '';
  coachHistory.forEach(m => {
    const div = document.createElement('div');
    div.className = `chat-msg ${m.role === 'assistant' ? 'msg-ai' : 'msg-user'}`;
    div.innerHTML = `<div class="msg-bubble">${m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
    wrap.appendChild(div);
  });
  wrap.scrollTop = wrap.scrollHeight;
}

async function sendCoachMessage() {
  const input = $('chat-in');
  const msgText = input.value.trim();
  if (!msgText) return;
  input.value = '';

  coachHistory.push({ role: 'user', text: msgText });
  renderCoachMessages();

  // Show "thinking" state
  const wrap = $('chat-messages-container');
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'chat-msg msg-ai thinking-bubble';
  thinkingDiv.innerHTML = `
    <div class="msg-bubble" style="display: inline-flex; align-items: center; gap: 8px;">
      <span class="thinking-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
      <span>Thinking...</span>
    </div>
  `;
  wrap.appendChild(thinkingDiv);
  wrap.scrollTop = wrap.scrollHeight;

  try {
    const data = await InterviewCoachAgent(selectedCareer, coachHistory);
    thinkingDiv.remove();
    coachHistory.push({ role: 'assistant', text: data.reply });
    renderCoachMessages();
  } catch (e) {
    thinkingDiv.remove();
    coachHistory.push({ role: 'assistant', text: `Snag occurred: ${e.message}. Please retry.` });
    renderCoachMessages();
  }
}

// ══════════════════════════════════════════
// FLOATING BOT WIDGET
// ══════════════════════════════════════════
let botHistory = [
  { role: 'assistant', text: 'Hi! 👋 I\'m your SheStarts AI assistant. Ask me anything about restarting your career, skills to learn, or how to use this platform!' }
];

function toggleFloatingBot() {
  const popup = $('floating-bot-popup');
  if (!popup) return;
  popup.classList.toggle('open');
  const icon = $('floating-bot-icon');
  if (icon) icon.textContent = popup.classList.contains('open') ? '✕' : '✨';
}

function renderBotMessages() {
  const wrap = $('bot-popup-messages');
  if (!wrap) return;
  wrap.innerHTML = '';
  botHistory.forEach(m => {
    const div = document.createElement('div');
    div.className = `chat-msg ${m.role === 'assistant' ? 'msg-ai' : 'msg-user'}`;
    div.innerHTML = `<div class="msg-bubble" style="font-size:13px;">${m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
    wrap.appendChild(div);
  });
  wrap.scrollTop = wrap.scrollHeight;
}

async function sendBotMessage() {
  const input = $('bot-chat-in');
  const msgText = input.value.trim();
  if (!msgText) return;
  input.value = '';

  botHistory.push({ role: 'user', text: msgText });
  renderBotMessages();

  // Show thinking
  const wrap = $('bot-popup-messages');
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'chat-msg msg-ai';
  thinkingDiv.innerHTML = `<div class="msg-bubble" style="font-size:13px;display:inline-flex;align-items:center;gap:6px;"><span class="thinking-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span><span>Thinking...</span></div>`;
  wrap.appendChild(thinkingDiv);
  wrap.scrollTop = wrap.scrollHeight;

  try {
    const data = await GeneralBotAgent(msgText, botHistory);
    thinkingDiv.remove();
    botHistory.push({ role: 'assistant', text: data.reply });
    renderBotMessages();
  } catch (e) {
    thinkingDiv.remove();
    botHistory.push({ role: 'assistant', text: `Sorry, something went wrong: ${e.message}` });
    renderBotMessages();
  }
}

// ══════════════════════════════════════════
// VOICE COUNSELOR (Web Speech API)
// ══════════════════════════════════════════
let voiceRecognition = null;

function createRecognition(targetInputId, sendFn) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
    return null;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = $(targetInputId);
    if (input) {
      input.value = transcript;
      if (sendFn) sendFn();
    }
  };
  recognition.onerror = (event) => {
    console.warn('Voice recognition error:', event.error);
  };
  return recognition;
}

function toggleVoice() {
  const btn = $('voice-btn');
  if (!btn) return;

  if (btn.classList.contains('listening')) {
    // Stop
    if (voiceRecognition) voiceRecognition.stop();
    btn.classList.remove('listening');
    return;
  }

  const recognition = createRecognition('chat-in', sendCoachMessage);
  if (!recognition) return;
  voiceRecognition = recognition;

  btn.classList.add('listening');
  recognition.onend = () => btn.classList.remove('listening');
  recognition.start();
}

function toggleBotVoice() {
  const btn = $('bot-voice-btn');
  if (!btn) return;

  if (btn.classList.contains('listening')) {
    if (voiceRecognition) voiceRecognition.stop();
    btn.classList.remove('listening');
    return;
  }

  const recognition = createRecognition('bot-chat-in', sendBotMessage);
  if (!recognition) return;
  voiceRecognition = recognition;

  btn.classList.add('listening');
  recognition.onend = () => btn.classList.remove('listening');
  recognition.start();
}

// ══════════════════════════════════════════
// JOB APPLICATION ASSISTANT
// ══════════════════════════════════════════
async function generateJobApplication() {
  const jd = $('job-jd-input').value.trim();
  if (!jd) {
    alert('Please paste a job description first.');
    return;
  }

  $('btn-job-assist').disabled = true;
  loading('job-assist-loading', true);
  $('job-assist-output').style.display = 'none';

  const profile = {
    name: userData.name,
    role: userData.role,
    selectedCareer: selectedCareer ? selectedCareer.title : '',
    skills: userData.skills,
    gap: userData.gap
  };

  try {
    const data = await JobApplicationAgent(jd, profile);
    $('jout-cover').textContent = data.coverLetter;
    $('jout-headline').textContent = data.linkedinHeadline;
    $('jout-keywords').textContent = data.topKeywords;
    $('jout-strategy').textContent = data.applicationStrategy;
    $('job-assist-output').style.display = 'block';
  } catch (e) {
    alert('Error generating application: ' + e.message);
  } finally {
    $('btn-job-assist').disabled = false;
    loading('job-assist-loading', false);
  }
}

function copyJobOutput() {
  const cover = $('jout-cover').textContent;
  const headline = $('jout-headline').textContent;
  const keywords = $('jout-keywords').textContent;
  const strategy = $('jout-strategy').textContent;

  const text = `COVER LETTER:\n${cover}\n\nLINKEDIN HEADLINE:\n${headline}\n\nTOP KEYWORDS:\n${keywords}\n\nAPPLICATION STRATEGY:\n${strategy}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = orig, 2000);
    }
  });
}

// ══════════════════════════════════════════
// WINDOW EXPORTS
// ══════════════════════════════════════════
window.showPage = showPage;
window.toggleChip = toggleChip;
window.nextStep = nextStep;
window.launchSampleUserDemo = launchSampleUserDemo;
window.runAnalysis = runAnalysis;
window.selectCareer = selectCareer;
window.sendCoachMessage = sendCoachMessage;
window.toggleFloatingBot = toggleFloatingBot;
window.sendBotMessage = sendBotMessage;
window.toggleVoice = toggleVoice;
window.toggleBotVoice = toggleBotVoice;
window.generateJobApplication = generateJobApplication;
window.copyJobOutput = copyJobOutput;
window.toggleSettingsPanel = toggleSettingsPanel;

// Auto-trigger roadmap fetch on entering roadmap page
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav-tab')) {
    if (e.target.textContent === 'Roadmap' && selectedCareer && !roadmapData) {
      fetchRoadmap();
    }
  }
});

