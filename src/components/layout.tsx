import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../Style/layout.css";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* BACK TO AUTM MODULE */
  const goBackToFinance = () => {
    navigate("/modules", {
      state: { scrollToModule: "autm" },
    });
  };

  const handleRestrictedNav = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setShowMessage(true);
  };

  const handleCloseMessage = () => setShowMessage(false);

  return (
    <div className="layout-container">
      {/* HERO SECTION */}
      <div
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
          padding: "28px",
          margin: "24px auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)",
            borderRadius: "28px",
            padding: "42px 36px 32px",
            boxShadow: "0 12px 30px rgba(59,130,246,0.10)",
            marginBottom: "28px",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            {/* BACK BUTTON */}
            <button
              onClick={goBackToFinance}
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "18px",
                border: "none",
                background:
                  "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                fontSize: "30px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow:
                  "0 12px 24px rgba(37,99,235,0.28)",
                transition: "all 0.3s ease",
              }}
            >
              ←
            </button>

            {/* TITLE */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "3rem",
                  fontWeight: 900,
                  color: "#1e3a8a",
                  lineHeight: 1.1,
                  letterSpacing: "-2px",
                }}
              >
                {title || "Working Capital"}
              </h1>

              <p
                style={{
                  marginTop: "18px",
                  color: "#475569",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Monitor liquidity, receivables, payables,
                inventory & cash cycle performance
              </p>
            </div>

            {/* REFRESH */}
            <button
              onClick={() => window.location.reload()}
              style={{
                background:
                  "linear-gradient(135deg, #0f172a, #1e293b)",
                color: "#fff",
                border: "none",
                padding: "18px 28px",
                borderRadius: "16px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow:
                  "0 8px 18px rgba(15,23,42,0.18)",
              }}
            >
              Refresh Dashboard
            </button>
          </div>

          {/* NAVIGATION */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
              background: "rgba(255,255,255,0.96)",
              padding: "22px",
              borderRadius: "22px",
              boxShadow:
                "0 8px 18px rgba(15,23,42,0.06)",
            }}
          >
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Overview
            </NavLink>

            <NavLink
              to="/liquidity"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Liquidity & Cash
            </NavLink>

            <NavLink
              to="/receivables"
              className="nav-link"
              onClick={handleRestrictedNav}
            >
              Account Receivables
            </NavLink>

            <NavLink
              to="/payables"
              className="nav-link"
              onClick={handleRestrictedNav}
            >
              Account Payable
            </NavLink>

            <NavLink
              to="/inventory"
              className="nav-link"
              onClick={handleRestrictedNav}
            >
              Inventory
            </NavLink>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main>{children}</main>

      {/* GO TOP */}
      <button
        onClick={scrollToTop}
        className={`go-top-button ${
          isVisible ? "visible" : ""
        }`}
        aria-label="Go to top"
      >
        &#8679;
      </button>

      {/* MODAL */}
      {showMessage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={handleCloseMessage}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px 24px",
              borderRadius: "12px",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.15)",
              maxWidth: 350,
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                color: "#c0392b",
                fontWeight: 600,
              }}
            >
              Not available in demo environment.
            </p>

            <button
              onClick={handleCloseMessage}
              style={{
                marginTop: 18,
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "#0072ce",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;