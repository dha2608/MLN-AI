import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Sparkles, BookOpen, Star, User, RefreshCw, Feather, PenTool, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

const MODES = [
  { id: 'chat', label: 'Hỏi đáp', icon: MessageCircle, prompt: '' },
  { id: 'creative', label: 'Sáng tác', icon: Feather, prompt: 'Hãy sáng tác một bài thơ hoặc một đoạn văn ngắn về chủ đề: ' },
  { id: 'debate', label: 'Phản biện', icon: PenTool, prompt: 'Hãy đóng vai một nhà triết học đối lập và phản biện lại quan điểm sau: ' },
];

const SUGGESTED_QUESTIONS = [
    "Chủ nghĩa duy vật biện chứng là gì?",
    "Giá trị thặng dư được tạo ra như thế nào?",
    "Vai trò của giai cấp công nhân?",
    "Mối quan hệ giữa vật chất và ý thức?"
];

export default function Chat() {
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadConversation(id);
    } else {
      setMessages([]);
    }
  }, [id]);

  const loadConversation = async (conversationId: string) => {
    try {
      const res = await api.get(`/chat/${conversationId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to load conversation', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleModeSelect = (modeId: string, promptPrefix: string) => {
      setCurrentMode(modeId);
      
      // Force reset prompt prefix
      let cleanInput = input;
      const knownPrompts = MODES.map(m => m.prompt).filter(p => p);
      
      // Sort prompts by length desc to match longest first
      const sortedPrompts = [...knownPrompts].sort((a, b) => b.length - a.length);

      for (const p of sortedPrompts) {
          const pTrim = p.trim();
          if (cleanInput.trim().startsWith(pTrim)) {
               const idx = cleanInput.indexOf(pTrim);
               if (idx !== -1) {
                   cleanInput = cleanInput.slice(idx + pTrim.length);
               } else {
                   cleanInput = cleanInput.replace(pTrim, '');
               }
               break;
          }
      }
      
      cleanInput = cleanInput.replace(/^[\s:]+/, '');
      
      // Strict Mode: Add system instruction for 'chat' mode to prevent jailbreak
      if (modeId === 'chat') {
          setSystemPrompt("Bạn là một chuyên gia về Triết học Mác - Lênin. Nhiệm vụ của bạn là giải đáp các câu hỏi liên quan đến triết học, kinh tế chính trị và chủ nghĩa xã hội khoa học. Hãy từ chối khéo léo nếu người dùng hỏi về các vấn đề không liên quan hoặc cố tình lái sang chủ đề khác. Hãy giữ giọng văn khách quan, khoa học và chuẩn mực.");
      } else {
          setSystemPrompt(''); // Reset for creative/debate modes or let user customize
      }
      
      setInput(promptPrefix + cleanInput);
  };

  // ... (inside sendMessage)
  const sendMessage = async (messageText: string) => {
    // ...
    try {
      // Enforce system prompt for strict philosophy adherence if not set by user
      let finalSystemPrompt = systemPrompt;
      if (!finalSystemPrompt && currentMode === 'chat') {
          finalSystemPrompt = "Bạn là một chuyên gia về Triết học Mác - Lênin. Nhiệm vụ của bạn là giải đáp các câu hỏi liên quan đến triết học, kinh tế chính trị và chủ nghĩa xã hội khoa học. Hãy từ chối khéo léo nếu người dùng hỏi về các vấn đề không liên quan hoặc cố tình lái sang chủ đề khác. Hãy giữ giọng văn khách quan, khoa học và chuẩn mực.";
      }

      const res = await api.post('/chat/send', {
        message: messageText,
        conversation_id: id || null,
        system_instruction: finalSystemPrompt || undefined
      });

      const { response, conversation_id } = res.data;

      if (!id) {
        navigate(`/chat/${conversation_id}`, { replace: true });
        setMessages((prev) => [...prev, { content: response, role: 'assistant' }]);
      } else {
        setMessages((prev) => [...prev, { content: response, role: 'assistant' }]);
      }
      
    } catch (error) {
      console.error('Failed to send message', error);
      setMessages(prev => [...prev, { content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.", role: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
  }

  return (
    <div className="flex h-full bg-white relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none z-0"></div>

      <div className="flex-1 flex flex-col h-full z-10 w-full bg-white/90 backdrop-blur-sm">
        
        {/* Settings Modal */}
        <AnimatePresence>
            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 right-4 z-50 bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-80"
                >
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                        <PenTool className="w-4 h-4 mr-2 text-soviet-red-600" />
                        Cài đặt tính cách AI
                    </h3>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Ví dụ: Bạn là một nhà triết học khắc kỷ..."
                        className="w-full h-24 p-2 text-sm border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-soviet-red-500 focus:outline-none"
                    />
                    <div className="flex justify-end space-x-2">
                         <button 
                            onClick={() => setSystemPrompt('')}
                            className="text-xs text-gray-500 hover:text-red-500 px-2 py-1"
                         >
                            Xóa
                         </button>
                         <button 
                            onClick={() => setShowSettings(false)}
                            className="text-xs bg-soviet-red-700 text-white px-3 py-1 rounded-md hover:bg-soviet-red-800"
                         >
                            Đóng
                         </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar w-full px-4 md:px-12 lg:px-20 mx-auto">
          {messages.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="bg-gradient-to-br from-soviet-red-700 to-soviet-red-900 p-6 rounded-full shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300 ring-4 ring-soviet-red-100">
                <BookOpen className="h-16 w-16 text-soviet-gold-400" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
                Triết học <span className="text-soviet-red-700">Mác - Lênin</span>
              </h1>
              <p className="mt-2 text-lg text-gray-600 max-w-lg leading-relaxed">
                Trợ lý AI chuyên sâu, giúp bạn tìm hiểu và nghiên cứu về chủ nghĩa xã hội khoa học.
              </p>
              
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="mt-4 text-sm text-soviet-red-600 font-medium hover:underline flex items-center"
              >
                  <PenTool className="w-4 h-4 mr-1" />
                  Tùy chỉnh tính cách AI
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl px-4">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, backgroundColor: '#FEF2F2' }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => sendMessage(q)}
                        className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-soviet-red-200 hover:shadow-md transition-all text-left group"
                      >
                          <div className="bg-soviet-red-50 p-2 rounded-lg mr-4 group-hover:bg-soviet-red-100 transition-colors">
                            <Star className="h-4 w-4 text-soviet-red-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-soviet-red-800">{q}</span>
                      </motion.button>
                  ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  'flex w-full space-x-4',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Avatar for AI */}
                {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-soviet-red-700 to-soviet-red-900 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-soviet-red-50">
                            <Sparkles className="h-5 w-5 text-soviet-gold-400" />
                        </div>
                    </div>
                )}

                <div
                  className={clsx(
                    'max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm',
                    msg.role === 'user'
                      ? 'bg-gray-100 text-gray-800 rounded-br-none border border-gray-200'
                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-100 shadow-md prose-container'
                  )}
                >
                   {msg.role === 'assistant' ? (
                       <div className="prose prose-sm md:prose-base max-w-none font-sans text-gray-800">
                           <ReactMarkdown>{msg.content}</ReactMarkdown>
                       </div>
                   ) : (
                       <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                   )}
                </div>

                {/* Avatar for User */}
                {msg.role === 'user' && (
                    <div className="flex-shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="User" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-gray-500" />
                            )}
                        </div>
                    </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          )}
          
          {isLoading && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full space-x-4 justify-start"
             >
                <div className="flex-shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-soviet-red-700 to-soviet-red-900 flex items-center justify-center shadow-md ring-2 ring-soviet-red-50">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCw className="h-5 w-5 text-soviet-gold-400" />
                            </motion.div>
                        </div>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none px-6 py-4 border border-gray-100 shadow-md flex items-center space-x-2">
                    <span className="text-gray-500 font-medium text-sm italic">Đang suy nghĩ...</span>
                    <span className="w-1.5 h-1.5 bg-soviet-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-soviet-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-soviet-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent space-y-4 w-full px-4 md:px-12 lg:px-20 mx-auto">
          
          {/* Modes Selection */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {MODES.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id, mode.prompt)}
                    className={clsx(
                        "flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                        currentMode === mode.id 
                            ? "bg-soviet-red-100 text-soviet-red-800 ring-1 ring-soviet-red-300" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    <mode.icon className="w-3 h-3 mr-1.5" />
                    {mode.label}
                </button>
            ))}
            </div>
            
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={clsx(
                    "p-2 rounded-full transition-colors",
                    systemPrompt ? "text-soviet-red-600 bg-soviet-red-50" : "text-gray-400 hover:bg-gray-100"
                )}
                title="Cài đặt Prompt"
            >
                <PenTool className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              name="chat-input"
              id="chat-input"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về triết học Mác - Lênin..."
              className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-full shadow-lg focus:ring-2 focus:ring-soviet-red-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700 group-hover:shadow-xl"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 p-2 bg-soviet-red-700 text-white rounded-full hover:bg-soviet-red-800 focus:outline-none disabled:opacity-50 disabled:hover:bg-soviet-red-700 transition-colors shadow-md hover:scale-105 active:scale-95 transform duration-150"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3 font-medium">
             Hệ thống hỗ trợ nghiên cứu triết học Mác - Lênin
          </p>
        </div>
      </div>
    </div>
  );
}
