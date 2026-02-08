import express from 'express';

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// AI Assistant endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = (await response.json()) as any;
    // Extract model message content safely
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

    // Clean content: remove code fences and excessive whitespace
    let cleaned = String(content || '').replace(/```[\s\S]*?```/g, '').trim();

    // If model returned raw JSON, try to parse it and provide structured format for ceremony parsing
    let structured = null;
    try {
      // attempt to find JSON substring
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1);
        structured = JSON.parse(jsonStr);
        // Remove the JSON from cleaned text - only show human-friendly format
        cleaned = cleaned.substring(0, jsonStart) + cleaned.substring(jsonEnd + 1);
      }
    } catch (err) {
      // ignore parse errors
      structured = null;
    }

    // Strip all remaining JSON-like content and code fences
    cleaned = cleaned
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`+/g, '')
      .replace(/\{[\s\S]*?\}/g, '') // Remove JSON objects
      .replace(/\[[\s\S]*?\]/g, '')  // Remove JSON arrays
      .replace(/["'`]/g, '')          // Remove quotes
      .trim();

    res.json({ reply: cleaned, structured });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Budget optimization endpoint
router.post('/budget-suggestions', async (req, res) => {
  try {
    const { budget, guestCount, city, priorities } = req.body;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const prompt = `You are a wedding budget optimization expert. Generate 3-5 specific, actionable budget suggestions for a wedding with these details:

Budget: $${budget.toLocaleString()}
Guest Count: ${guestCount}
Location: ${city}
Priorities: ${priorities.join(', ') || 'Not specified'}

For each suggestion:
- Start with a relevant emoji
- Be specific with dollar amounts or percentages
- Focus on realistic cost-saving strategies
- Consider the city's cost of living
- Prioritize their stated preferences

Format each suggestion as: "emoji Suggestion text"
Example: "💐 Consider in-season flowers to save $1,500-$2,000 on florals"

Generate 4 actionable suggestions:`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a wedding budget optimization expert. Provide specific, actionable, and realistic budget advice.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = (await response.json()) as any;
    const content = data.choices[0]?.message?.content || '';
    
    // Parse suggestions from response
    const suggestions = content
      .split('\n')
      .filter((line: string) => line.trim().match(/^[^\w\s]/))
      .map((line: string) => line.trim())
      .slice(0, 4);

    res.json({ suggestions });
  } catch (error) {
    console.error('Budget suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
