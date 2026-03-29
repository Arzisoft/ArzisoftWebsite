import { ArrowRight, Check } from "lucide-react";

const products = [
  {
    name: "Anyemi Software",
    description:
      "A comprehensive business management platform that streamlines operations, automates workflows, and provides real-time analytics for smarter decision-making.",
    features: [
      "Intelligent task management",
      "Real-time analytics dashboard",
      "Multi-team collaboration",
      "Automated reporting system",
    ],
    tag: "Flagship",
    tagColor: "#3B82F6",
  },
  {
    name: "WhatsApp Solutions",
    description:
      "Enterprise-grade WhatsApp integration suite with chatbots, automated customer support, broadcast messaging, and advanced CRM connectivity.",
    features: [
      "Smart chatbot engine",
      "Broadcast & bulk messaging",
      "CRM integration ready",
      "Conversation analytics",
    ],
    tag: "Popular",
    tagColor: "#8B5CF6",
  },
  {
    name: "Automation Suite",
    description:
      "End-to-end business automation that connects your existing tools, eliminates repetitive tasks, and scales your operations with intelligent workflows.",
    features: [
      "Visual workflow builder",
      "500+ app integrations",
      "Smart decision engine",
      "Custom triggers & actions",
    ],
    tag: "New",
    tagColor: "#22C55E",
  },
];

export function ProductsPage() {
  return (
    <div style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-28">
        {/* Header */}
        <div className="text-center mb-20">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Products
          </p>
          <h1 className="mb-4" style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.1, color: "#1A1A1A", letterSpacing: "-0.03em",
          }}>
            Our Products
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", color: "#9CA3AF", maxWidth: "440px", margin: "0 auto" }}>
            Finished. Tested. Ready to Deploy.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="group rounded-2xl p-8 transition-all duration-300 flex flex-col"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.07)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Tag */}
              <span
                className="inline-block self-start px-3 py-1 rounded-full mb-6"
                style={{
                  background: product.tagColor + "0D",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: product.tagColor,
                }}
              >
                {product.tag}
              </span>

              <h3 className="mb-3" style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: "22px", color: "#1A1A1A", letterSpacing: "-0.01em",
              }}>
                {product.name}
              </h3>

              <p className="mb-8" style={{
                fontFamily: "'Inter', sans-serif", fontSize: "14px",
                color: "#9CA3AF", lineHeight: 1.7,
              }}>
                {product.description}
              </p>

              {/* Features */}
              <div className="flex flex-col gap-3 mb-8 flex-1">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "#F3F4F6" }}
                    >
                      <Check size={11} style={{ color: "#1A1A1A" }} />
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#6B7280" }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                className="w-full py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:opacity-90"
                style={{
                  background: "#1A1A1A",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                }}
              >
                Learn More <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
