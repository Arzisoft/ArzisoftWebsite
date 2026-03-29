import { ShoppingCart, Package, Settings, Truck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const hardwareProducts = [
  {
    name: "Arizi GPU Station Pro",
    description:
      "High-performance GPU workstation optimized for model training, inference, and deep learning research.",
    image:
      "https://images.unsplash.com/photo-1770992225357-21917af96dfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21wdXRlciUyMHdvcmtzdGF0aW9uJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MzcwMTUzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specs: ["NVIDIA RTX 4090 x2", "128GB DDR5 RAM", "4TB NVMe SSD", "Liquid Cooled"],
    price: "$4,999",
  },
  {
    name: "Arizi Server Rack S1",
    description:
      "Enterprise server rack designed for deployment at scale with redundant power and advanced cooling.",
    image:
      "https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjB0ZWNobm9sb2d5JTIwaW5mcmFzdHJ1Y3R1cmUlMjBjbGVhbnxlbnwxfHx8fDE3NzM3MDE1MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specs: ["Dual Xeon Processors", "512GB ECC RAM", "8x 2TB SSD RAID", "Redundant PSU"],
    price: "$12,499",
  },
  {
    name: "Arizi Edge Laptop",
    description:
      "Ultraportable development laptop with dedicated NPU for on-device inference and mobile workflows.",
    image:
      "https://images.unsplash.com/photo-1620233389768-4eafd182841a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBwcm9mZXNzaW9uYWwlMjBzbGVlayUyMG1pbmltYWx8ZW58MXx8fHwxNzczNzAxNTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specs: ["Intel Core Ultra 9", "64GB LPDDR5X", "2TB Gen5 SSD", "Dedicated NPU"],
    price: "$2,999",
  },
];

const steps = [
  {
    icon: Package,
    number: "01",
    title: "Choose Your Build",
    desc: "Select the hardware configuration that fits your workflow and requirements.",
  },
  {
    icon: Settings,
    number: "02",
    title: "We Configure",
    desc: "Our team tunes every machine for your specific workloads and use cases.",
  },
  {
    icon: Truck,
    number: "03",
    title: "Ship & Support",
    desc: "Fast delivery with ongoing technical support and warranty coverage.",
  },
];

export function HardwarePage() {
  return (
    <div style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-28">
        {/* Header */}
        <div className="text-center mb-20">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#8B5CF6",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            Hardware
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
            AI Hardware
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
            Powerful machines. Built for intelligent work.
          </p>
        </div>

        {/* Hardware Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-28">
          {hardwareProducts.map((product) => (
            <div
              key={product.name}
              className="group rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0,0,0,0.07)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden" style={{ background: "#F3F4F6" }}>
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "18px",
                      color: "#1A1A1A",
                    }}
                  >
                    {product.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#1A1A1A",
                    }}
                  >
                    {product.price}
                  </span>
                </div>

                <p
                  className="mb-5"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#9CA3AF",
                    lineHeight: 1.7,
                  }}
                >
                  {product.description}
                </p>

                {/* Specs */}
                <div className="flex flex-wrap gap-2 mb-6 flex-1">
                  {product.specs.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1.5 rounded-lg"
                      style={{
                        background: "#F9FAFB",
                        border: "1px solid rgba(0,0,0,0.04)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#6B7280",
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Buy Button */}
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
                  <ShoppingCart size={15} /> Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center mb-14">
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
            Process
          </p>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 3vw, 36px)",
              lineHeight: 1.2,
              color: "#1A1A1A",
              letterSpacing: "-0.02em",
            }}
          >
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative text-center p-8 rounded-2xl"
              style={{
                background: "#FAFAFA",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              {/* Step connector */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-1/2 -right-3 w-6 h-px"
                  style={{ background: "rgba(0,0,0,0.1)" }}
                />
              )}

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#1A1A1A",
                  }}
                >
                  {step.number}
                </span>
              </div>
              <h3
                className="mb-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#1A1A1A",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "#9CA3AF",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
