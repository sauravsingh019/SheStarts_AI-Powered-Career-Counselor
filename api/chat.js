// api/chat.js
// Vercel Serverless Function to securely proxy AI API requests

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, model, promptText, systemInstruction } = req.body;

  try {
    if (provider === 'nvidia') {
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'NVIDIA NIM API Key not configured in Vercel Environment Variables.' });
      }

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
          model: model || 'meta/llama-3.3-70b-instruct',
          messages: messages,
          temperature: 0.2,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return res.status(resp.status).json({ error: err.error?.message || `NVIDIA NIM API error` });
      }

      const data = await resp.json();
      return res.status(200).json({ content: data.choices[0].message.content });

    } else if (provider === 'openrouter') {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'OpenRouter API Key not configured in Vercel Environment Variables.' });
      }

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
          model: model || 'deepseek/deepseek-chat',
          messages: messages,
          temperature: 0.2,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return res.status(resp.status).json({ error: err.error?.message || `OpenRouter API error` });
      }

      const data = await resp.json();
      return res.status(200).json({ content: data.choices[0].message.content });

    } else {
      // Default to Google Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API Key not configured in Vercel Environment Variables.' });
      }

      const targetModel = model || 'gemini-3.5-flash';
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
        return res.status(resp.status).json({ error: err.error?.message || `Gemini API error` });
      }

      const data = await resp.json();
      return res.status(200).json({ content: data.candidates[0].content.parts[0].text });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
