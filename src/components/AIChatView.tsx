import React from "react";
import { Send, HelpCircle, PhoneCall, Sparkles, MessageSquare, ArrowRight, User } from "lucide-react";

interface AIChatViewProps {
  lang: "en" | "np";
  onNavigateToTab: (t: string, searchFilter?: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function AIChatView({ lang, onNavigateToTab }: AIChatViewProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        lang === "en"
          ? "Namaste! 🙏 I'm your Sunkoshi Bearing Centre Smart Assistant. I can help you find products, check live stock availability, verify brand pricing, or recommend parts compatible with your tractor model. How can I help you today?"
          : "नमस्ते! 🙏 सुनकोशी बियरिङ सेन्टर एआई सहायकमा यहाँलाई स्वागत छ। म तपाईंलाई बियरिङ खोज्न, मौजदात विवरण जाँच गर्न, ब्रान्डको मूल्य बुझ्न वा ट्रयाक्टरमा मिल्ने सामान सिफारिस गर्न मद्दत गर्न सक्छु। आज म तपाईंलाई के सहयोग गरौँ?"
    }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Suggested prompt questions
  const suggestedPrompts = lang === "en"
    ? [
        "Do you have SKF 6204 bearing?",
        "Recommend grease for Mahindra tractor",
        "Which bearing is best for Swaraj front wheel?",
        "Where is the shop located?"
      ]
    : [
        "के तपाईंसँग SKF 6204 बियरिङ उपलब्ध छ?",
        "महिन्द्रा ट्रयाक्टरको लागि ग्रीस सिफारिस गर्नुहोस्",
        "स्वराज अगाडिको पाङ्ग्राको लागि कुन बियरिङ राम्रो हुन्छ?",
        "पसलको ठेगाना कहाँ छ?"
      ];

  // Scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    const messageText = textToSend.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          chatHistory: messages.slice(1) // omit introductory message for size
        })
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            lang === "en"
              ? "I apologize, but I am facing difficulty connecting to our servers. Please call Sita Ram Regmi directly at +977 9842176142 for instant stock checks!"
              : "माफ गर्नुहोला, सर्भरसँग जडान हुन सकेन। तत्काल मौजदात जाँच गर्न सिधै सीता राम रेग्मीलाई +९७७ ९८४२१७६१४२ मा फोन गर्नुहोस्!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative">
      {/* AI Header */}
      <div className="bg-[#121217] border-b border-white/5 p-4 text-white flex items-center justify-between shadow-xs sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/25">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-display tracking-tight leading-none">
              Sunkoshi AI Copilot
            </h4>
            <span className="text-[8px] text-amber-500 font-bold">
              ● {lang === "en" ? "Grounded in Specs" : "जडान उपलब्ध छ"}
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab("catalog")}
          className="text-[9px] font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1 text-slate-300"
        >
          <span>{lang === "en" ? "Browse Store" : "स्टोर हेर्नुहोस्"}</span>
          <ArrowRight className="h-3 w-3 text-amber-500" />
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className={`flex items-start gap-2 max-w-[85%] ${
                isUser ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border flex-shrink-0 ${
                  isUser
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-amber-500 border-amber-400 text-black font-extrabold"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : "⚙️"}
              </div>

              {/* Message Body */}
              <div
                className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-amber-500 text-black font-semibold rounded-tr-xs"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-100 dark:border-slate-800"
                }`}
              >
                {/* Process lists/newlines in simple text rendering */}
                <div className="whitespace-pre-line font-sans">
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-2 self-start max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-amber-500 border border-amber-400 text-black flex items-center justify-center text-xs font-bold">
              ⚙️
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl rounded-tl-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Area */}
      {messages.length === 1 && !loading && (
        <div className="px-4 pb-2 flex-shrink-0 flex flex-col gap-1.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
            {lang === "en" ? "Frequently Asked Questions" : "प्राय सोधिने प्रश्नहरू"}
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="w-full text-left p-2 bg-white hover:bg-amber-500/5 dark:bg-slate-900 dark:hover:bg-amber-500/5 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 rounded-xl transition-all shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={
              lang === "en" ? "Ask AI assistant..." : "कृत्रिम बुद्धिमत्ता सहायकसँग सोध्नुहोस्..."
            }
            className="flex-1 py-2 px-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-850 disabled:text-slate-400 text-black font-bold rounded-xl transition-all shadow-xs flex items-center justify-center"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
