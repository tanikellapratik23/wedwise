// AI Budget Optimization via server proxy
export async function generateAIBudgetSuggestions(
  budget: number,
  guestCount: number,
  city: string,
  priorities: string[]
): Promise<string[]> {
  try {
    const resp = await fetch('/api/ai/budget-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget, guestCount, city, priorities }),
    });

    if (!resp.ok) {
      console.error('AI budget proxy error:', await resp.text());
      return [];
    }

    const data = await resp.json();
    return data.suggestions || [];
  } catch (err) {
    console.error('generateAIBudgetSuggestions failed:', err);
    return [];
  }
}
