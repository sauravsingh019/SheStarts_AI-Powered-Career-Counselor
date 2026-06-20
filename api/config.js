// api/config.js
// Vercel Serverless Function to securely check environment variable statuses

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  function isValidKey(key) {
    if (!key) return false;
    const trimmed = key.trim();
    if (!trimmed) return false;
    if (trimmed.toUpperCase().startsWith('YOUR_')) return false;
    if (trimmed === 'your_nvidia_nim_api_key_here' || trimmed === 'your_openrouter_api_key_here') return false;
    return true;
  }

  try {
    return res.status(200).json({
      gemini: isValidKey(process.env.GEMINI_API_KEY),
      nvidia: isValidKey(process.env.NVIDIA_NIM_API_KEY),
      openrouter: isValidKey(process.env.OPENROUTER_API_KEY)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
