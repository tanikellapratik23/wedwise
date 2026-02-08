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

    const data = await response.json();
    // Extract model message content safely
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

    // Clean content: remove code fences and excessive whitespace
    let cleaned = String(content || '').replace(/```[\s\S]*?```/g, '').trim();

    // If model returned raw JSON, try to parse it and provide both structured and plain text
    let structured = null;
    try {
      // attempt to find JSON substring
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1);
        structured = JSON.parse(jsonStr);
        // create a short human-friendly summary
        cleaned = 'Here are the suggestions:\n' + (Array.isArray(structured.ceremony) ? structured.ceremony.map((s:any,i:number)=>`${i+1}. ${s.time || ''} — ${s.ritual || ''}`).join('\n') : JSON.stringify(structured));
      }
    } catch (err) {
      // ignore parse errors
      structured = null;
    }

    // Final safety: strip any remaining markdown code fences
    cleaned = cleaned.replace(/`+/g, '').trim();

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

    const data = await response.json();
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
