import { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles, Send, Plus } from 'lucide-react';

interface CeremonyStep {
  time: string;
  ritual: string;
}

interface CeremonyResponse {
  ceremony: CeremonyStep[];
  notes: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; type?: string }>;
  timestamp: number;
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

// Example prompts to suggest to users
const EXAMPLE_PROMPTS = [
  "How do I plan a Hindu-Christian wedding ceremony?",
  "What are some modern interfaith wedding traditions?",
  "Can you suggest a wedding timeline for an interfaith wedding?",
  "How do I incorporate both families' traditions respectfully?",
  "What should I include in my wedding invitations?",
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [editableResponse, setEditableResponse] = useState<CeremonyResponse | null>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = (sessions: ChatSession[]) => {
    localStorage.setItem('chat_history', JSON.stringify(sessions));
    setChatHistory(sessions);
  };

  // Create new chat session
  const createNewChat = () => {
    const session: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setCurrentSession(session);
    setEditableResponse(null);
  };

  // Start first chat on open
  useEffect(() => {
    if (isOpen && !currentSession) {
      createNewChat();
    }
  }, [isOpen, currentSession]);

  // Load a specific chat session
  const loadSession = (sessionId: string) => {
    const session = chatHistory.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setEditableResponse(null);
    }
  };

  // Delete a chat session
  const deleteSession = (sessionId: string) => {
    const updated = chatHistory.filter(s => s.id !== sessionId);
    saveChatHistory(updated);
    if (currentSession?.id === sessionId) {
      createNewChat();
    }
  };

  const updateCeremonyStep = (index: number, field: 'time' | 'ritual', value: string) => {
    if (!editableResponse) return;
    
    const newCeremony = [...editableResponse.ceremony];
    newCeremony[index] = { ...newCeremony[index], [field]: value };
    setEditableResponse({ ...editableResponse, ceremony: newCeremony });
  };

  // Parse and execute budget commands
  const executeBudgetCommand = (prompt: string): { executed: boolean; message?: string } => {
    const lowerPrompt = prompt.toLowerCase();
    
    const addMatch = lowerPrompt.match(/add\s+(\d+(?:,\d{3})*(?:\.\d{2})?|(\d+)k)\s+(?:to\s+)?(?:budget\s+)?(?:for\s+)?(\w+)/i);
    const setMatch = lowerPrompt.match(/set\s+(\w+)\s+(?:to|budget)\s+(\d+(?:,\d{3})*(?:\.\d{2})?|(\d+)k)/i);
    
    let categoryName = '';
    let amount = 0;
    
    if (addMatch) {
      // Handle both regular numbers and k notation (e.g., "20k" = 20000)
      const amountStr = addMatch[1].toLowerCase();
      if (amountStr.includes('k')) {
        amount = parseFloat(amountStr.replace('k', '')) * 1000;
      } else {
        amount = parseFloat(amountStr.replace(/,/g, ''));
      }
      categoryName = addMatch[3];
    } else if (setMatch) {
      const amountStr = setMatch[2].toLowerCase();
      if (amountStr.includes('k')) {
        amount = parseFloat(amountStr.replace('k', '')) * 1000;
      } else {
        amount = parseFloat(amountStr.replace(/,/g, ''));
      }
      categoryName = setMatch[1];
    } else {
      return { executed: false };
    }
    
    try {
      const cached = localStorage.getItem('budget');
      const budget = cached ? JSON.parse(cached) : [];
      const categoryIndex = budget.findIndex((cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase());
      
      if (categoryIndex >= 0) {
        budget[categoryIndex].estimatedAmount = amount;
      } else {
        budget.push({
          id: `local-${Date.now()}`,
          name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
          estimatedAmount: amount,
          actualAmount: 0,
          paid: 0,
        });
      }
      
      localStorage.setItem('budget', JSON.stringify(budget));
      
      const event = new CustomEvent('budgetChanged', {
        detail: { categories: budget }
      });
      window.dispatchEvent(event);
      
      return { 
        executed: true, 
        message: `Budget updated! Added ${amount.toLocaleString()} for ${categoryName}.` 
      };
    } catch (error) {
      console.error('Failed to execute budget command:', error);
      return { executed: false };
    }
  };

  // Parse and execute guest commands
  const executeGuestCommand = (prompt: string): { executed: boolean; message?: string } => {
    const lowerPrompt = prompt.toLowerCase();
    
    const guestMatch = lowerPrompt.match(/add\s+([\w\s]+?)\s+(?:as\s+)?(?:a\s+)?guest(?:s)?(?:\s+(no\s+)?plus\s+one)?/i);
    
    if (!guestMatch) return { executed: false };
    
    const guestNames = guestMatch[1].split(/\s+(?:and|,)\s+/);
    const hasPlusOne = !lowerPrompt.includes('no plus one');
    
    try {
      const cached = localStorage.getItem('guests');
      const guests = cached ? JSON.parse(cached) : [];
      
      const newGuests: any[] = [];
      guestNames.forEach((name) => {
        const trimmedName = name.trim();
        if (trimmedName) {
          newGuests.push({
            id: `local-${Date.now()}-${Math.random()}`,
            name: trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1),
            email: '',
            phone: '',
            rsvpStatus: 'pending',
            mealPreference: '',
            plusOne: hasPlusOne,
            group: '',
          });
        }
      });
      
      const updatedGuests = [...guests, ...newGuests];
      localStorage.setItem('guests', JSON.stringify(updatedGuests));
      
      const event = new CustomEvent('guestsChanged', {
        detail: { guests: updatedGuests }
      });
      window.dispatchEvent(event);
      
      const guestText = newGuests.length === 1 ? '1 guest' : `${newGuests.length} guests`;
      const plusOneText = hasPlusOne ? 'with plus one' : 'no plus one';
      
      return {
        executed: true,
        message: `Added ${guestText}! ${newGuests.map(g => g.name).join(', ')} (${plusOneText}).`
      };
    } catch (error) {
      console.error('Failed to execute guest command:', error);
      return { executed: false };
    }
  };

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
      if (data?.reply) return { reply: data.reply, structured: data.structured };
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
  const handleSend = async (prompt?: string) => {
    const messageToSend = prompt || userInput.trim();
    if (!messageToSend || loading || !currentSession) return;

    setUserInput('');
    
    const updatedMessages = [...currentSession.messages, { role: 'user' as const, content: messageToSend }];
    let sessionTitle = currentSession.title;
    
    // Generate title from first message
    if (currentSession.messages.length === 0) {
      sessionTitle = messageToSend.substring(0, 50);
      if (messageToSend.length > 50) sessionTitle += '...';
    }
    
    const newSession = { ...currentSession, messages: updatedMessages, title: sessionTitle };
    setCurrentSession(newSession);
    setLoading(true);
    setEditableResponse(null);

    try {
      // Check budget command
      const budgetResult = executeBudgetCommand(messageToSend);
      if (budgetResult.executed) {
        const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: budgetResult.message || 'Budget updated!', type: 'text' }];
        const finalSession = { ...newSession, messages: finalMessages };
        setCurrentSession(finalSession);
        const updated = chatHistory.map(s => s.id === finalSession.id ? finalSession : s);
        if (!chatHistory.find(s => s.id === finalSession.id)) {
          updated.push(finalSession);
        }
        saveChatHistory(updated);
      } else {
        // Check guest command
        const guestResult = executeGuestCommand(messageToSend);
        
        if (guestResult.executed) {
          const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: guestResult.message || 'Guest added!', type: 'text' }];
          const finalSession = { ...newSession, messages: finalMessages };
          setCurrentSession(finalSession);
          const updated = chatHistory.map(s => s.id === finalSession.id ? finalSession : s);
          if (!chatHistory.find(s => s.id === finalSession.id)) {
            updated.push(finalSession);
          }
          saveChatHistory(updated);
        } else {
          // Call AI
          const aiResult = await callAIAPI(messageToSend);
          const responseText = aiResult.reply || '';
          let responseType = 'text';

          if (aiResult.structured && aiResult.structured.ceremony && Array.isArray(aiResult.structured.ceremony)) {
            responseType = 'ceremony';
            setEditableResponse(aiResult.structured as CeremonyResponse);
          } else {
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

          const cleaned = String(responseText).replace(/```[\s\S]*?```/g, '').replace(/`+/g, '').trim();
          const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: cleaned, type: responseType }];
          const finalSession = { ...newSession, messages: finalMessages };
          setCurrentSession(finalSession);
          
          const updated = chatHistory.map(s => s.id === finalSession.id ? finalSession : s);
          if (!chatHistory.find(s => s.id === finalSession.id)) {
            updated.push(finalSession);
          }
          saveChatHistory(updated);
        }
      }
    } catch (error) {
      const errorMessages = [...updatedMessages, { role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.', type: 'error' }];
      const errorSession = { ...newSession, messages: errorMessages };
      setCurrentSession(errorSession);
      const updated = chatHistory.map(s => s.id === errorSession.id ? errorSession : s);
      if (!chatHistory.find(s => s.id === errorSession.id)) {
        updated.push(errorSession);
      }
      saveChatHistory(updated);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden">
        {/* Left Sidebar - Chat History */}
        <div className="w-64 bg-gradient-to-b from-purple-50 to-pink-50 border-r border-purple-200 flex flex-col">
          <button
            onClick={createNewChat}
            className="m-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Chat
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2 px-3">
            {chatHistory.map(session => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-all truncate ${
                  currentSession?.id === session.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-white/60 bg-white/40'
                }`}
                title={session.title}
              >
                {session.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">VivahaPlan AI</h2>
                <p className="text-white/90 text-sm">Wedding Planning Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentSession && currentSession.messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <p className="text-lg font-medium mb-2">Welcome to VivahaPlan AI!</p>
                <p className="text-sm mb-6">Hello! I'm VivahaPlan AI, here to help you plan a beautiful and meaningful interfaith wedding.</p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Try asking me about:</p>
                  {EXAMPLE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      disabled={loading}
                      className="block w-full text-left px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-purple-700 text-sm rounded-lg transition-all border border-purple-200 disabled:opacity-50"
                    >
                      • {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              currentSession?.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : msg.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.type === 'ceremony' && editableResponse ? (
                      <div className="space-y-3">
                        <p className="font-semibold text-purple-700 mb-2">Ceremony Schedule (Editable)</p>
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
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
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
                placeholder="Ask about ceremonies, budget, guests..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !userInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
