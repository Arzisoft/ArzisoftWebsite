import { useState } from "react";
import { Send, ChevronDown, Bot, User, Sparkles } from "lucide-react";

const models = [
  { id: "arizi-7b", name: "Arizi-7B", desc: "Fast & efficient" },
  { id: "arizi-13b", name: "Arizi-13B", desc: "Balanced performance" },
  { id: "arizi-70b", name: "Arizi-70B", desc: "Maximum intelligence" },
];

const initialMessages = [
  {
    role: "ai" as const,
    content:
      "Hello! I'm Arizi AI, your intelligent assistant. I can help you with coding, analysis, creative writing, and much more. How can I assist you today?",
  },
  {
    role: "human" as const,
    content: "Can you help me build an automated customer support system?",
  },
  {
    role: "ai" as const,
    content:
      "Absolutely! I'd recommend a multi-layered approach:\n\n1. Intent Classification — Use NLP to categorize incoming queries\n2. Knowledge Base — Build a dynamic FAQ system with semantic search\n3. Escalation Logic — Smart routing to human agents when needed\n4. Analytics Dashboard — Track resolution rates and response times\n\nWould you like me to dive deeper into any of these components?",
  },
];

export function AIChatPage() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "human", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Great question! Based on your needs, I'd suggest starting with our Automation Suite for workflow orchestration, paired with a custom integration layer. Want me to outline a technical architecture?",
        },
      ]);
    }, 800);
  };

  return (
    <div style={{ background: "#FAFAFA" }}>
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-28">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#3B82F6",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            AI Chat
          </p>
          <h1
            className="mb-4"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              color: "#1A1A1A",
              letterSpacing: "-0.03em",
            }}
          >
            Meet Our AI Models
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              color: "#9CA3AF",
              maxWidth: "460px",
              margin: "0 auto",
            }}
          >
            Explore intelligence. Talk to our local LLMs.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="max-w-[720px] mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
            }}
          >
            {/* Model Selector Bar */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#1A1A1A" }}
                >
                  <Sparkles size={15} style={{ color: "#FFFFFF" }} />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#1A1A1A",
                    }}
                  >
                    Arizi AI
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "12px",
                        color: "#9CA3AF",
                      }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#6B7280",
                    }}
                  >
                    {selectedModel.name}
                  </span>
                  <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-10"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    }}
                  >
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left transition-colors cursor-pointer flex items-center justify-between"
                        style={{
                          background:
                            selectedModel.id === model.id
                              ? "#F9FAFB"
                              : "transparent",
                          borderBottom: "1px solid rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedModel.id !== model.id)
                            e.currentTarget.style.background = "#F9FAFB";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            selectedModel.id === model.id
                              ? "#F9FAFB"
                              : "transparent";
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#1A1A1A",
                            }}
                          >
                            {model.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "12px",
                              color: "#9CA3AF",
                            }}
                          >
                            {model.desc}
                          </div>
                        </div>
                        {selectedModel.id === model.id && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#3B82F6" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              className="px-5 py-6 flex flex-col gap-5"
              style={{
                minHeight: "400px",
                maxHeight: "480px",
                overflowY: "auto",
                background: "#FAFAFA",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "human" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: msg.role === "ai" ? "#1A1A1A" : "#E5E7EB",
                    }}
                  >
                    {msg.role === "ai" ? (
                      <Bot size={15} style={{ color: "#FFFFFF" }} />
                    ) : (
                      <User size={15} style={{ color: "#6B7280" }} />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3.5 rounded-2xl ${msg.role === "human" ? "rounded-tr-md" : "rounded-tl-md"}`}
                    style={{
                      background: msg.role === "ai" ? "#FFFFFF" : "#1A1A1A",
                      border:
                        msg.role === "ai"
                          ? "1px solid rgba(0,0,0,0.06)"
                          : "none",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        color: msg.role === "ai" ? "#374151" : "#FFFFFF",
                        lineHeight: 1.7,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div
              className="px-5 py-4"
              style={{
                borderTop: "1px solid rgba(0,0,0,0.05)",
                background: "#FFFFFF",
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "#F9FAFB",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#1A1A1A",
                  }}
                />
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{
                    background: input.trim() ? "#1A1A1A" : "#E5E7EB",
                  }}
                >
                  <Send
                    size={15}
                    style={{
                      color: input.trim() ? "#FFFFFF" : "#9CA3AF",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
