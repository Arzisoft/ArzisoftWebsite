import { Link } from "react-router";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Services", path: "/services" },
  { name: "AI Chat", path: "/ai-chat" },
  { name: "Hardware", path: "/hardware" },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer style={{ background: "#FAFAFA", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#1A1A1A" }}
              >
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "15px", color: "#FFFFFF" }}>
                  A
                </span>
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "18px", color: "#1A1A1A", letterSpacing: "-0.02em" }}>
                Arizisoft
              </span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#9CA3AF", lineHeight: 1.7 }}>
              Building the Future of Solutions
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-3">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px", color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Pages
            </span>
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="transition-colors duration-200"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#6B7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1A1A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px", color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Connect
            </span>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ background: "rgba(0,0,0,0.04)", color: "#6B7280" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1A1A1A";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    e.currentTarget.style.color = "#6B7280";
                  }}
                  aria-label={social.label}
                >
                  <social.icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#9CA3AF" }}>
            &copy; 2026 Arizisoft. All rights reserved.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#9CA3AF" }}>
            Building the Future of Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
