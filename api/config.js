// api/config.js
// Vercel Serverless Function to securely check environment variable statuses

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    return res.status(200).json({
      gemini: !!process.env.GEMINI_API_KEY,
      nvidia: !!process.env.NVIDIA_NIM_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
