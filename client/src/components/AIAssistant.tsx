import { useState } from 'react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';

interface CeremonyStep {
  time: string;
  ritual: string;
}

interface CeremonyResponse {
  ceremony: CeremonyStep[];
  notes: string[];
}

// Use server-side AI proxy endpoints to avoid embedding secrets in the client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AI_CHAT_ENDPOINT = `${API_URL}/api/ai/chat`;

// System prompt for VivahaPlan AI
const SYSTEM_PROMPT = `You are VivahaPlan AI, an expert assistant helping couples plan interfaith weddings. You provide:
1. Ceremony suggestions as JSON with 'ceremony' (array of {time, ritual}) and 'notes' (array of strings)
2. Factual, culturally respectful FAQ answers
3. Culturally sensitive invitation and email copy

Always be respectful of both traditions, consider dietary restrictions, and provide practical advice.`;

// Example prompts for quick access
const EXAMPLE_PROMPTS = [
  {
    label: '🕉️✝️ Hindu-Christian Ceremony',
    prompt: 'Generate a 3-hour Hindu-Christian ceremony schedule with key rituals from both traditions. Include timing for each ritual.',
    type: 'ceremony'
  },
  {
    label: '❓ FAQ: Alcohol at Ceremony',
    prompt: 'Can we serve alcohol at a dual Hindu-Muslim ceremony? What are the cultural considerations?',
    type: 'faq'
  },
  {
    label: '💌 Wedding Invite Copy',
    prompt: 'Write a culturally sensitive wedding invitation for Priya (Hindu) and Michael (Christian), wedding date March 15, 2026 in San Francisco.',
    type: 'email'
  }
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; type?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [editableResponse, setEditableResponse] = useState<CeremonyResponse | null>(null);

  // Call AI API (Groq or HuggingFace)
  const callAIAPI = async (prompt: string): Promise<{ reply: string; structured?: any }> => {
    try {
      const response = await fetch(AI_CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, systemPrompt: SYSTEM_PROMPT }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI proxy error:', errorText);
        throw new Error(`AI proxy error: ${response.status}`);
      }

      const data = await response.json();
      // Prefer a normalized { reply, structured } shape from the server
      if (data?.reply) return { reply: data.reply, structured: data.structured };
      // Backwards compatibility: handle direct OpenAI/Groq-like responses
      if (data?.choices && data.choices[0]?.message?.content) {
        return { reply: data.choices[0].message.content };
      }
      if (data?.text) return { reply: data.text };

      throw new Error('Unexpected AI proxy response format');
    } catch (err) {
      console.error('Call AI API failed:', err);
      throw err;
    }
  };

  // Handle sending message
  const handleSend = async () => {
    if (!userInput.trim() || loading) return;

    const prompt = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);
    setEditableResponse(null);

    try {
      const aiResult = await callAIAPI(prompt);
      const responseText = aiResult.reply || '';
      let responseType = 'text';

      // If server provided structured payload, prefer that for ceremony editing
      if (aiResult.structured && aiResult.structured.ceremony && Array.isArray(aiResult.structured.ceremony)) {
        responseType = 'ceremony';
        setEditableResponse(aiResult.structured as CeremonyResponse);
      } else {
        // Try to parse plain text as JSON (legacy behavior)
        try {
          const parsed = JSON.parse(responseText);
          if (parsed.ceremony && Array.isArray(parsed.ceremony)) {
            responseType = 'ceremony';
            setEditableResponse(parsed);
          }
        } catch {
          // not JSON
        }
      }

      // Ensure assistant messages are plain text only
      const cleaned = String(responseText).replace(/```[\s\S]*?```/g, '').replace(/`+/g, '').trim();

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: cleaned,
        type: responseType
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or rephrase your question.',
        type: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle example prompt click
  const handleExampleClick = (prompt: string) => {
    setUserInput(prompt);
  };

  // Update editable ceremony
  const updateCeremonyStep = (index: number, field: 'time' | 'ritual', value: string) => {
    if (!editableResponse) return;
    
    const newCeremony = [...editableResponse.ceremony];
    newCeremony[index] = { ...newCeremony[index], [field]: value };
    setEditableResponse({ ...editableResponse, ceremony: newCeremony });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 hover:scale-110 transition-all duration-300 flex items-center gap-2"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">VivahaPlan AI</h2>
              <p className="text-white/90 text-sm">Your Interfaith Wedding Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Example Prompts */}
        {messages.length === 0 && (
          <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-b">
            <p className="text-gray-700 font-medium mb-3">Try these example prompts:</p>
            <div className="grid grid-cols-1 gap-2">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example.prompt)}
                  className="text-left p-3 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-sm"
                >
                  <span className="font-semibold text-purple-700">{example.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <p className="text-lg font-medium">Ask me anything about your interfaith wedding!</p>
              <p className="text-sm mt-2">I can help with ceremony planning, FAQs, and invitations.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : msg.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.role === 'assistant' && msg.type === 'ceremony' && editableResponse ? (
                    <div className="space-y-3">
                      <p className="font-semibold text-purple-700 mb-2">✨ Ceremony Schedule (Editable)</p>
                      {editableResponse.ceremony.map((step, stepIdx) => (
                        <div key={stepIdx} className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={step.time}
                              onChange={(e) => updateCeremonyStep(stepIdx, 'time', e.target.value)}
                              className="w-24 px-2 py-1 border rounded text-sm font-mono"
                              placeholder="00:00"
                            />
                            <input
                              type="text"
                              value={step.ritual}
                              onChange={(e) => updateCeremonyStep(stepIdx, 'ritual', e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm"
                              placeholder="Ritual name"
                            />
                          </div>
                        </div>
                      ))}
                      {editableResponse.notes && editableResponse.notes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <p className="font-semibold text-purple-700 mb-2">📝 Notes:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {editableResponse.notes.map((note, noteIdx) => (
                              <li key={noteIdx}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-gray-600 text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about ceremony planning, traditions, invitations..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !userInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are advisory. Always verify important details.
          </p>
        </div>
      </div>
    </div>
  );
}
