
import React, { useState, useRef, useEffect } from "react";
import { Bulb } from "lucide-react";

const mockMessages = [
  { from: "ai", text: "👋 Hello! Ask me anything about your SQL or schema." },
  { from: "user", text: "How do I join the users and orders table?" },
  { from: "ai", text: "Use: SELECT * FROM public.users u JOIN public.orders o ON u.id = o.user_id" },
];

const FloatingAIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { from: "ai", text: "This is a mock response! Real AI is coming soon." }
      ]);
    }, 800);
    setInput("");
  };

  return (
    <>
      {/* Floating Bulb Icon */}
      <button
        aria-label="Ask AI Assistant"
        className="fixed z-50 bottom-7 right-8 bg-white border border-gray-200 shadow-xl rounded-full p-3 flex items-center justify-center hover:bg-blue-50 transition-colors"
        style={{ boxShadow: "0 3px 18px 0 rgba(18,34,57,.16)" }}
        onClick={() => setOpen(true)}
      >
        <Bulb size={28} className="text-yellow-400" />
      </button>
      {open && (
        <div
          className="fixed z-50 bottom-24 right-6 w-[325px] bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0"
          style={{
            boxShadow: "0 4px 32px 0 rgba(20,36,65,.10), 0 1.5px 4px 0 rgba(18,34,57,.13)",
            minHeight: 308
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-2 bg-blue-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bulb className="text-yellow-400" size={20} />
              <span className="text-sm font-semibold text-gray-700">AI Assistant (demo)</span>
            </div>
            <button
              aria-label="Close chat"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
          {/* Chat Messages */}
          <div className="flex-1 px-4 py-2 overflow-y-auto bg-white space-y-2">
            {messages.map((msg, i) => (
              <div key={i}
                className={
                  msg.from === "ai"
                    ? "flex text-xs gap-2 items-start"
                    : "flex flex-row-reverse text-xs gap-2 items-start"
                }
              >
                <div
                  className={
                    msg.from === "ai"
                      ? "bg-gray-100 rounded-lg p-2 text-gray-700 max-w-[220px]"
                      : "bg-blue-100 rounded-lg p-2 text-blue-700 max-w-[220px]"
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          {/* Chat Input */}
          <form
            onSubmit={sendMessage}
            className="flex items-center px-3 py-2 border-t bg-white gap-2"
            autoComplete="off"
          >
            <input
              ref={inputRef}
              className="flex-1 text-xs px-3 py-2 border rounded-full bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ minHeight: 32 }}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full px-3 py-2 text-xs font-semibold hover:bg-blue-600 transition"
              style={{ minHeight: 32 }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingAIAssistant;
