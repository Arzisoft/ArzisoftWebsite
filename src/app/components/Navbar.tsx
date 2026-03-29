import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Services", path: "/services" },
  { name: "AI Chat", path: "/ai-chat" },
  { name: "Hardware", path: "/hardware" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#1A1A1A" }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                color: "#FFFFFF",
              }}
            >
              A
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#1A1A1A",
              letterSpacing: "-0.02em",
            }}
          >
            Arizisoft
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-4 py-2 rounded-full transition-all duration-200"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: location.pathname === link.path ? 500 : 400,
                color: location.pathname === link.path ? "#1A1A1A" : "#6B7280",
                background:
                  location.pathname === link.path
                    ? "rgba(0,0,0,0.04)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== link.path)
                  e.currentTarget.style.color = "#1A1A1A";
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.path)
                  e.currentTarget.style.color = "#6B7280";
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/ai-chat"
            className="ml-4 px-5 py-2.5 rounded-full transition-all duration-200 hover:opacity-90"
            style={{
              background: "#1A1A1A",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          style={{ color: "#1A1A1A" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6 flex flex-col gap-1"
          style={{ background: "rgba(255,255,255,0.98)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                fontWeight: location.pathname === link.path ? 500 : 400,
                color: location.pathname === link.path ? "#1A1A1A" : "#6B7280",
                background:
                  location.pathname === link.path
                    ? "rgba(0,0,0,0.03)"
                    : "transparent",
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
