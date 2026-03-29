import { Link } from "react-router";
import { Box, Cpu, MessageSquare, HardDrive, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const pillars = [
  { icon: Box, label: "Products", desc: "Ready-to-deploy software that works from day one.", path: "/products" },
  { icon: Cpu, label: "Services", desc: "End-to-end development and consulting.", path: "/services" },
  { icon: MessageSquare, label: "AI Chat", desc: "Intelligent conversations, real answers.", path: "/ai-chat" },
  { icon: HardDrive, label: "Hardware", desc: "Powerful machines built for performance.", path: "/hardware" },
];

export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#FFFFFF" }}>
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[100px]" style={{ background: "#3B82F6" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px]" style={{ background: "#8B5CF6" }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center pt-24">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#6B7280" }}>
              Now available — Arizisoft AI Chat
            </span>
          </div>

          <h1 className="mb-6" style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(40px, 5.5vw, 76px)",
            lineHeight: 1.05,
            color: "#1A1A1A",
            letterSpacing: "-0.03em",
          }}>
            The Future of
            <br />
            Solutions
          </h1>

          <p className="max-w-xl mx-auto mb-10" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#6B7280",
            lineHeight: 1.7,
          }}>
            Finished products. Intelligent services. Real results.
            <br />
            We build software that moves your business forward.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/products"
              className="px-7 py-3.5 rounded-full flex items-center gap-2 transition-all duration-200 hover:opacity-90"
              style={{
                background: "#1A1A1A",
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                fontWeight: 500,
                color: "#FFFFFF",
              }}
            >
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link
              to="/services"
              className="px-7 py-3.5 rounded-full flex items-center gap-2 transition-all duration-200"
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                fontWeight: 500,
                color: "#1A1A1A",
                background: "#FFFFFF",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
            >
              Talk to Us
            </Link>
          </div>

          {/* Hero visual */}
          <div className="mt-20 rounded-2xl overflow-hidden mx-auto max-w-[960px]" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1690383922983-90d7a4658ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGJyaWdodHxlbnwxfHx8fDE3NzM3MDE1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Team collaboration"
              className="w-full h-[420px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-28" style={{ background: "#FAFAFA" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              What we do
            </p>
            <h2 style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 700,
              fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.15, color: "#1A1A1A", letterSpacing: "-0.02em",
            }}>
              Everything you need,<br />one company
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar) => (
              <Link
                key={pillar.label}
                to={pillar.path}
                className="group p-7 rounded-2xl transition-all duration-200"
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
                  <pillar.icon size={20} style={{ color: "#1A1A1A" }} />
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "16px", color: "#1A1A1A", marginBottom: "6px" }}>
                  {pillar.label}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#9CA3AF", lineHeight: 1.6 }}>
                  {pillar.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-28" style={{ background: "#FFFFFF" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                About Arizisoft
              </p>
              <h2 className="mb-6" style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 700,
                fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.15, color: "#1A1A1A", letterSpacing: "-0.02em",
              }}>
                Solutions that deliver real outcomes
              </h2>
              <p className="mb-5" style={{
                fontFamily: "'Inter', sans-serif", fontSize: "16px",
                color: "#6B7280", lineHeight: 1.8,
              }}>
                Arizisoft is a modern technology company focused on building finished, production-ready
                software products, offering end-to-end development services, and providing the hardware
                infrastructure businesses need to scale.
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: "16px",
                color: "#6B7280", lineHeight: 1.8,
              }}>
                We believe great technology should be accessible, reliable, and easy to work with.
                That's why every product we ship and service we deliver is built with simplicity
                and quality at the core.
              </p>

              <div className="flex gap-16 mt-12">
                {[
                  { value: "50+", label: "Projects Delivered" },
                  { value: "99%", label: "Client Satisfaction" },
                  { value: "24/7", label: "Support Uptime" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "32px", color: "#1A1A1A", letterSpacing: "-0.02em" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#9CA3AF", fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1560438718-eb61ede255eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG1pbmltYWwlMjBkZXNrdG9wJTIwd29ya3NwYWNlJTIwd2hpdGV8ZW58MXx8fHwxNzczNzAxNTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Modern workspace"
                  className="w-full h-[440px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
