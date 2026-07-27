export default async function handler(req, res) {
  const { season } = req.query;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 40,
        messages: [
          {
            role: 'user',
            content: `Write one short, poetic, dreamy sentence (under 10 words, lowercase, no quotes) about the feeling of ${season}. It will appear as a fading caption on a whimsical website. Respond with ONLY the sentence, nothing else.`
          }
        ]
      })
    });

    const data = await response.json();
    const line = data.content?.[0]?.text?.trim() || 'the season is quietly changing';
    res.status(200).json({ line });
  } catch (err) {
    res.status(200).json({ line: 'the season is quietly changing' });
  }
}