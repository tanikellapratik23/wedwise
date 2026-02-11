import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader, ChevronDown, GripHorizontal } from 'lucide-react';
import axios from 'axios';
import { userDataStorage } from '../utils/userDataStorage';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// Use server-side AI proxy endpoints to avoid embedding secrets in the client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Quick prompts for different topics
const QUICK_PROMPTS = [
  { icon: '💰', text: 'Budget tips', query: 'What are the best ways to allocate my wedding budget?' },
  { icon: '👥', text: 'Guest list', query: 'How many guests should I invite to my wedding?' },
  { icon: '🎂', text: 'Vendors', query: 'What questions should I ask potential vendors?' },
  { icon: '📅', text: 'Timeline', query: 'What is the ideal wedding planning timeline?' },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [size, setSize] = useState<Size>({ width: 384, height: 384 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize position to bottom right on first mount
  useEffect(() => {
    setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 420 });
  }, []);

  // Load position and size from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aiAssistantState');
    if (saved) {
      try {
        const { position: savedPos, size: savedSize } = JSON.parse(saved);
        setPosition(savedPos || { x: window.innerWidth - 420, y: window.innerHeight - 420 });
        setSize(savedSize || { width: 384, height: 384 });
      } catch (e) {
        // Use defaults on parse error
      }
    }
  }, []);

  useEffect(() => {
    // Load user settings for context
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/onboarding', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save position and size when they change
  useEffect(() => {
    localStorage.setItem('aiAssistantState', JSON.stringify({ position, size }));
  }, [position, size]);

  // Handle mouse down on header to start dragging
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left + position.x,
      y: e.clientY - rect.top + position.y,
    });
  };

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setSize({
        width: Math.max(300, resizeStart.width + deltaX),
        height: Math.max(300, resizeStart.height + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart]);

  const systemPrompt = `You are Vivaha AI Assistant, a friendly expert wedding planning AI. You help couples with decisions about weddings.

User's wedding details:
- Role: ${userSettings?.role || 'Not specified'}
- Wedding style: ${userSettings?.weddingStyle || 'Not specified'}
- Location: ${userSettings?.weddingCity || 'Not specified'}, ${userSettings?.weddingState || ''}
- Budget: $${userSettings?.estimatedBudget || 'Not specified'}
- Guest count: ${userSettings?.guestCount || 'Not specified'}
- Top priorities: ${Array.isArray(userSettings?.topPriority) ? userSettings.topPriority.join(', ') : 'Not specified'}

Provide concise, actionable advice. Be encouraging. Keep responses under 150 words.`;

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowQuickPrompts(false);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/ai/chat`,
        {
          message: input,
          systemPrompt,
        }
      );

      let reply = response.data.reply || 'I encountered an issue. Please try again.';

      // Check for navigation commands
      const navigationPatterns = [
        { keywords: ['budget', 'expenses'], path: '/dashboard/budget' },
        { keywords: ['guest', 'guests'], path: '/dashboard/guests' },
        { keywords: ['vendor', 'vendors'], path: '/dashboard/vendors' },
        { keywords: ['todo', 'task', 'tasks'], path: '/dashboard/todos' },
        { keywords: ['overview', 'dashboard', 'home'], path: '/dashboard/overview' },
        { keywords: ['split', 'vivaha split', 'expense split'], path: '/dashboard/vivaha-split' },
        { keywords: ['registry'], path: '/dashboard/registry' },
        { keywords: ['seating'], path: '/dashboard/seating' },
      ];

      for (const pattern of navigationPatterns) {
        if (pattern.keywords.some(kw => input.toLowerCase().includes(kw))) {
          reply = `Navigating to ${pattern.keywords[0]} page... ✅ Done`;
          // Emit navigation event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('aiNavigate', { detail: { path: pattern.path } }));
          }, 500);
          break;
        }
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'assistant',
        content: 'Sorry, I couldn\'t process your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        title="AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
        <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg whitespace-nowrap text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Ask AI anything
        </div>
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed z-40 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        >
          {/* Header - Draggable */}
          <div
            onMouseDown={handleHeaderMouseDown}
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-4 flex items-center justify-between cursor-move hover:from-primary-600 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <GripHorizontal className="w-4 h-4" />
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">Vivaha AI</h3>
                <p className="text-xs text-white/80">Wedding expert</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.length === 0 && showQuickPrompts ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-600 mb-3">Quick questions:</p>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(prompt.query);
                        handleSendMessage();
                      }}
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
                    >
                      <span className="text-sm">{prompt.icon}</span>
                      <span className="text-left">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-xs leading-snug">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-3 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything..."
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="px-2 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-primary-500 to-transparent cursor-nwse-resize rounded-tl-lg opacity-50 hover:opacity-100 transition-opacity"
            title="Drag to resize"
          />
        </div>
      )}
    </>
  );
}
