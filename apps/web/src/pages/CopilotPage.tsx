import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Plus, AlertTriangle, History, ChevronLeft } from 'lucide-react';
import api from '../lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: string[];
}

interface ConversationListItem {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

const SUGGESTED_PROMPTS = [
    'What are common side effects of chemotherapy?',
    'How can I manage tic triggers at work?',
    'What is the difference between early and late Lyme?',
    'What foods help during cancer treatment?',
    'Can you explain immunotherapy in simple terms?',
];

export default function CopilotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [history, setHistory] = useState<ConversationListItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [disclaimer, setDisclaimer] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversation history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const { data } = await api.get('/copilot/history');
            setHistory(data);
        } catch {
            // History unavailable (user not logged in, etc.)
        }
    };

    const loadConversation = async (id: string) => {
        try {
            const { data } = await api.get(`/copilot/history/${id}`);
            setConversationId(data.id);
            setMessages(data.messages || []);
            setShowHistory(false);
        } catch (err) {
            console.error('Failed to load conversation:', err);
        }
    };

    const deleteConversation = async (id: string) => {
        try {
            await api.delete(`/copilot/history/${id}`);
            setHistory((prev) => prev.filter((c) => c.id !== id));
            if (conversationId === id) {
                startNewChat();
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setConversationId(null);
        setDisclaimer('');
        setShowHistory(false);
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || loading) return;

        const userMsg: Message = { role: 'user', content, timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/copilot/chat', {
                message: content,
                conversationId,
            });

            // Track the conversation ID for follow-up messages
            if (data.conversationId) {
                setConversationId(data.conversationId);
            }

            // Set the disclaimer from the backend
            if (data.disclaimer) {
                setDisclaimer(data.disclaimer);
            }

            const aiMsg: Message = {
                role: 'assistant',
                content: data.message.content,
                timestamp: data.message.timestamp,
                sources: data.message.sources,
            };
            setMessages((prev) => [...prev, aiMsg]);

            // Refresh history sidebar
            loadHistory();
        } catch (err: any) {
            const errorMsg: Message = {
                role: 'assistant',
                content: err.response?.data?.message
                    || 'I apologize, but I\'m having trouble connecting right now. Please try again later.\n\n⚕️ *This information is for educational purposes only. Always consult your healthcare provider.*',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-2xl flex items-center justify-center shadow-sm">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold text-calm-800">AI Health Copilot</h1>
                        <p className="text-xs text-calm-400">Powered by verified medical sources</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="btn-secondary text-sm gap-1.5"
                    >
                        <History className="w-4 h-4" />
                        History
                    </button>
                    <button onClick={startNewChat} className="btn-secondary text-sm gap-1.5">
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                    <strong>Medical Disclaimer:</strong> This AI provides educational health information only.
                    It cannot diagnose conditions or prescribe treatments. Always consult your healthcare provider.
                </p>
            </div>

            {/* History Sidebar */}
            {showHistory && (
                <div className="card mb-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-semibold text-calm-800">Conversation History</h3>
                        <button onClick={() => setShowHistory(false)} className="text-calm-400 hover:text-calm-600">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                    {history.length === 0 ? (
                        <p className="text-sm text-calm-400 py-4 text-center">No previous conversations.</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {history.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${conversationId === conv.id
                                            ? 'bg-primary-50 border border-primary-200'
                                            : 'hover:bg-calm-50 border border-transparent'
                                        }`}
                                >
                                    <button
                                        onClick={() => loadConversation(conv.id)}
                                        className="flex-1 text-left"
                                    >
                                        <p className="text-sm font-medium text-calm-700 truncate">{conv.title || 'Untitled conversation'}</p>
                                        <p className="text-xs text-calm-400">
                                            {new Date(conv.updatedAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conv.id);
                                        }}
                                        className="p-1.5 text-calm-300 hover:text-red-500 transition-colors ml-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chat Area */}
            <div className="card min-h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-16">
                            <Bot className="w-16 h-16 text-calm-200 mx-auto mb-4" />
                            <h3 className="text-lg font-display font-semibold text-calm-600 mb-2">
                                How can I help you today?
                            </h3>
                            <p className="text-sm text-calm-400 mb-6">
                                Ask about your condition, treatments, coping strategies, or wellness tips.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                                {SUGGESTED_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        className="text-xs bg-calm-50 text-calm-600 px-3 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors border border-calm-100"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-secondary-600" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-md'
                                            : 'bg-calm-50 text-calm-700 rounded-bl-md border border-calm-100'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                                <Bot className="w-4 h-4 text-secondary-600" />
                            </div>
                            <div className="bg-calm-50 rounded-2xl rounded-bl-md px-4 py-3 border border-calm-100">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-calm-300 rounded-full animate-pulse-soft" />
                                    <span className="w-2 h-2 bg-calm-300 rounded-full animate-pulse-soft [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 bg-calm-300 rounded-full animate-pulse-soft [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer from API */}
                {disclaimer && (
                    <p className="text-xs text-calm-400 text-center mb-2">{disclaimer}</p>
                )}

                {/* Input */}
                <div className="flex gap-3 pt-4 border-t border-calm-100">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                        className="input-field flex-1"
                        placeholder="Ask about your condition, treatments, or wellness..."
                        disabled={loading}
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="btn-primary px-4"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
