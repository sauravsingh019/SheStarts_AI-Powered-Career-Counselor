// api/chat.js
// Vercel Serverless Function to securely proxy AI API requests

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, model, promptText, systemInstruction } = req.body;

  let activeProvider = provider;
  let activeModel = model;

  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasNvidia = !!process.env.NVIDIA_NIM_API_KEY;
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

  // Fall back to gemini if requested provider's key is missing
  if (activeProvider === 'nvidia' && !hasNvidia) {
    activeProvider = 'gemini';
    activeModel = 'gemini-3.5-flash';
  } else if (activeProvider === 'openrouter' && !hasOpenRouter) {
    activeProvider = 'gemini';
    activeModel = 'gemini-3.5-flash';
  }

  // Helper function to call Google Gemini
  async function runGeminiCall() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API Key is not configured in Vercel Environment Variables.');
    }
    const targetModel = activeModel || 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    
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
      throw new Error(err.error?.message || `Gemini API error ${resp.status}`);
    }

    const data = await resp.json();
    return data.candidates[0].content.parts[0].text;
  }

  try {
    if (activeProvider === 'nvidia') {
      try {
        const apiKey = process.env.NVIDIA_NIM_API_KEY;
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
            model: activeModel || 'meta/llama-3.3-70b-instruct',
            messages: messages,
            temperature: 0.2,
            max_tokens: 2048,
            response_format: { type: 'json_object' }
          })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `NVIDIA NIM API error`);
        }

        const data = await resp.json();
        return res.status(200).json({ content: data.choices[0].message.content });
      } catch (err) {
        console.warn(`Server-side NVIDIA NIM failed: ${err.message}. Retrying with Gemini Fallback.`);
        if (hasGemini) {
          const content = await runGeminiCall();
          return res.status(200).json({ content });
        }
        throw err;
      }

    } else if (activeProvider === 'openrouter') {
      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
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
            model: activeModel || 'deepseek/deepseek-chat',
            messages: messages,
            temperature: 0.2,
            max_tokens: 2048,
            response_format: { type: 'json_object' }
          })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `OpenRouter API error`);
        }

        const data = await resp.json();
        return res.status(200).json({ content: data.choices[0].message.content });
      } catch (err) {
        console.warn(`Server-side OpenRouter failed: ${err.message}. Retrying with Gemini Fallback.`);
        if (hasGemini) {
          const content = await runGeminiCall();
          return res.status(200).json({ content });
        }
        throw err;
      }

    } else {
      // Default to Google Gemini
      const content = await runGeminiCall();
      return res.status(200).json({ content });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
