import { Link } from "react-router";
import { Brain, Workflow, Palette, Code, Server, Settings, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Brain,
    name: "AI Integration",
    desc: "Seamlessly integrate AI and machine learning capabilities into your existing products and workflows.",
  },
  {
    icon: Workflow,
    name: "Business Automation",
    desc: "Automate repetitive processes with intelligent workflows that learn and adapt over time.",
  },
  {
    icon: Palette,
    name: "Web Design",
    desc: "Stunning, conversion-focused designs with modern UI/UX principles built for every device.",
  },
  {
    icon: Code,
    name: "Frontend Development",
    desc: "Pixel-perfect React and modern frontend development with blazing-fast performance.",
  },
  {
    icon: Server,
    name: "Backend Development",
    desc: "Scalable API architecture, database design, and cloud infrastructure for enterprise apps.",
  },
  {
    icon: Settings,
    name: "Software Solutions",
    desc: "Custom software built from the ground up, tailored exactly to your business requirements.",
  },
];

export function ServicesPage() {
  return (
    <div style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-28">
        {/* Header */}
        <div className="text-center mb-20">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Services
          </p>
          <h1 className="mb-4" style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.1, color: "#1A1A1A", letterSpacing: "-0.03em",
          }}>
            What We Offer
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", color: "#9CA3AF", maxWidth: "460px", margin: "0 auto" }}>
            End-to-end solutions built for the future.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-28">
          {services.map((service) => (
            <div
              key={service.name}
              className="group p-7 rounded-2xl transition-all duration-200 cursor-pointer"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "#F3F4F6" }}
              >
                <service.icon size={20} style={{ color: "#1A1A1A" }} />
              </div>
              <h3 className="mb-2" style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: "16px", color: "#1A1A1A",
              }}>
                {service.name}
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: "14px",
                color: "#9CA3AF", lineHeight: 1.7,
              }}>
                {service.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div
          className="rounded-3xl p-16 text-center"
          style={{
            background: "#FAFAFA",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <h2 className="mb-4" style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700,
            fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.2, color: "#1A1A1A", letterSpacing: "-0.02em",
          }}>
            Let's Build Together
          </h2>
          <p className="mb-8 max-w-lg mx-auto" style={{
            fontFamily: "'Inter', sans-serif", fontSize: "16px",
            color: "#9CA3AF", lineHeight: 1.7,
          }}>
            Ready to bring your next project to life? Let's discuss how
            Arizisoft can turn your vision into a working product.
          </p>
          <Link
            to="/ai-chat"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full transition-all duration-200 hover:opacity-90"
            style={{
              background: "#1A1A1A",
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            Start a Conversation <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
