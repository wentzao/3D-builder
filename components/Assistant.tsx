import React, { useState } from 'react';
import { Challenge } from '../types';
import { generateChallenge, checkAnswer, askConcept } from '../services/geminiService';
import { Bot, Sparkles, Send } from 'lucide-react';

interface AssistantProps {
  currentBlockCount: number;
}

const Assistant: React.FC<AssistantProps> = ({ currentBlockCount }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleNewChallenge = async () => {
    setLoading(true);
    setFeedback("");
    setAnswer("");
    try {
      const newChallenge = await generateChallenge();
      setChallenge(newChallenge);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!challenge) return;
    setLoading(true);
    try {
      const result = await checkAnswer(currentBlockCount, challenge);
      setFeedback(result);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
      if(!question.trim()) return;
      setLoading(true);
      try {
          const ans = await askConcept(question);
          setAnswer(ans);
      } finally {
          setLoading(false);
      }
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-4 pointer-events-none">
      {/* Main Panel */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border-2 border-indigo-100 w-80 pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 p-2 rounded-full">
             <Bot className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">AI 數學助教</h2>
        </div>

        {!challenge ? (
          <div className="text-center py-4">
            <p className="text-slate-600 mb-4">你好！我是你的幾何小助教。<br/>準備好接受挑戰了嗎？</p>
            <button
              onClick={handleNewChallenge}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Sparkles size={18} />
              {loading ? '正在出題...' : '給我一個挑戰！'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <h3 className="font-bold text-indigo-800 mb-1">{challenge.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{challenge.description}</p>
            </div>
            
            {feedback && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800 animate-fade-in">
                💡 {feedback}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCheck}
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm"
              >
                {loading ? '檢查中...' : '我做好了！檢查答案'}
              </button>
              <button
                onClick={handleNewChallenge}
                disabled={loading}
                className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded-lg text-sm transition-colors"
              >
                換一題
              </button>
            </div>
          </div>
        )}
      </div>

       {/* Q&A Section Toggle */}
       <div className="pointer-events-auto w-80">
            <button 
                onClick={() => setChatOpen(!chatOpen)}
                className="w-full bg-white/90 p-3 rounded-xl shadow-md border border-slate-200 text-slate-600 font-semibold hover:bg-white text-left flex justify-between items-center"
            >
                <span>🤔 有問題想問？</span>
                <span>{chatOpen ? '▼' : '▲'}</span>
            </button>
            
            {chatOpen && (
                <div className="mt-2 bg-white/95 p-4 rounded-2xl shadow-xl border border-slate-200">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="例如：什麼是體積？"
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                            onClick={handleAsk}
                            disabled={loading}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    {answer && (
                        <div className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto">
                            {answer}
                        </div>
                    )}
                </div>
            )}
       </div>
    </div>
  );
};

export default Assistant;