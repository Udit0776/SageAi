"use client";

import React, { useState, useEffect } from "react";

// ─── Icons (inline SVG, zero deps) ───────────────────────────────────────────
const Icons = {
  Code: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  External: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
  Mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  Arrow: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>,
  Sparkle: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>,
  Layers: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const P = "#7c3aed"; // primary purple
const P2 = "#6d28d9";
const BG = "#080010";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";

// ─── Reusable primitives ──────────────────────────────────────────────────────

function Btn({ children, variant = "solid", href, onClick, style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "0 24px", height: 44, borderRadius: 14,
    fontSize: 12, fontWeight: 800, cursor: "pointer",
    letterSpacing: "0.05em", textTransform: "uppercase",
    textDecoration: "none", border: "none", transition: "all .25s",
    fontFamily: "inherit",
  };
  const solid = { background: P, color: "#fff", boxShadow: `0 0 24px ${P}55` };
  const outline = { background: CARD, color: "#ccc", border: `1px solid ${BORDER}` };
  const s = { ...base, ...(variant === "solid" ? solid : outline), ...style };

  const handleHover = (e, enter) => {
    if (variant === "solid") {
      e.currentTarget.style.boxShadow = enter ? `0 0 40px ${P}88` : `0 0 24px ${P}55`;
      e.currentTarget.style.background = enter ? P2 : P;
    } else {
      e.currentTarget.style.borderColor = enter ? `${P}88` : BORDER;
      e.currentTarget.style.background = enter ? `${P}18` : CARD;
      e.currentTarget.style.color = enter ? "#fff" : "#ccc";
    }
  };

  if (href) return <a href={href} style={s} onMouseEnter={e => handleHover(e, true)} onMouseLeave={e => handleHover(e, false)}>{children}</a>;
  return <button style={s} onClick={onClick} onMouseEnter={e => handleHover(e, true)} onMouseLeave={e => handleHover(e, false)}>{children}</button>;
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ width: 20, height: 1, background: P }} />
      <span style={{ fontSize: 10, fontWeight: 900, color: P, letterSpacing: "0.3em", textTransform: "uppercase" }}>{children}</span>
      <div style={{ width: 20, height: 1, background: P }} />
    </div>
  );
}

function GlassCard({ children, style = {}, hover = true }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: hov ? `${P}0e` : CARD,
        border: `1px solid ${hov ? P + "55" : BORDER}`,
        borderRadius: 20,
        backdropFilter: "blur(20px)",
        transition: "all .4s",
        transform: hov ? "translateY(-3px)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Project Mockup ───────────────────────────────────────────────────────────

function ProjectMockup() {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        position: "absolute", inset: -16, borderRadius: "50%",
        background: `${P}22`, filter: "blur(50px)",
        opacity: hov ? 1 : 0, transition: "opacity .8s",
        pointerEvents: "none",
      }} />
      <div style={{
        borderRadius: 20, overflow: "hidden",
        border: `1px solid ${hov ? P + "44" : BORDER}`,
        background: "#050008",
        boxShadow: hov ? `0 30px 70px rgba(0,0,0,.7), 0 0 0 1px ${P}22` : "0 20px 50px rgba(0,0,0,.5)",
        transition: "all .5s",
      }}>
        {/* Browser bar */}
        <div style={{ height: 36, background: "rgba(255,255,255,.03)", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}99` }} />
            ))}
          </div>
          <div style={{ flex: 1, height: 20, borderRadius: 8, background: "rgba(255,255,255,.04)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 10px", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28c840", opacity: .6 }} />
            <div style={{ height: 3, width: 90, borderRadius: 4, background: "rgba(255,255,255,.1)" }} />
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${P}22`, border: `1px solid ${P}33` }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 8, width: "40%", borderRadius: 4, background: "rgba(255,255,255,.15)" }} />
              <div style={{ height: 6, width: "30%", borderRadius: 4, background: "rgba(255,255,255,.07)" }} />
            </div>
            <div style={{ height: 22, width: 56, borderRadius: 20, background: `${P}22`, border: `1px solid ${P}33` }} />
          </div>
          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[[70, 40, 60], [55, 85, 35], [65, 30, 80]].map((bars, i) => (
              <div key={i} style={{ borderRadius: 12, background: "rgba(255,255,255,.03)", border: `1px solid ${BORDER}`, padding: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 8, background: `${P}${["22", "18", "15"][i]}`, marginBottom: 8 }} />
                {bars.map((w, j) => <div key={j} style={{ height: 4, width: `${w}%`, borderRadius: 4, background: "rgba(255,255,255,.1)", marginBottom: 5 }} />)}
              </div>
            ))}
          </div>
          {/* Chart */}
          <div style={{ borderRadius: 14, background: `${P}08`, border: `1px solid ${P}18`, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
              {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: "3px 3px 0 0",
                  background: hov ? `${P}88` : `${P}44`,
                  height: `${h}%`, transition: `all .6s ${i * 30}ms`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orbit Visual ─────────────────────────────────────────────────────────────

function OrbitVisual({ initial = "ζ" }) {
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${P}33 0%, transparent 70%)`, filter: "blur(30px)" }} />
      <div className="spin1" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${P}33` }} />
      <div className="spin2" style={{ position: "absolute", inset: 24, borderRadius: "50%", border: `1px solid ${P}22` }} />
      <div className="spin3" style={{ position: "absolute", inset: 48, borderRadius: "50%", border: `1px solid ${P}33` }} />
      {/* Orbiting dots */}
      <div className="spin1" style={{ position: "absolute", inset: 0, borderRadius: "50%" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", width: 8, height: 8, borderRadius: "50%", background: P, boxShadow: `0 0 10px ${P}` }} />
      </div>
      <div className="spin2" style={{ position: "absolute", inset: 24, borderRadius: "50%" }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 8px #a78bfa" }} />
      </div>
      {/* Center */}
      <div style={{
        position: "relative", zIndex: 10, width: 64, height: 64, borderRadius: 18,
        background: `linear-gradient(135deg, ${P}, #4338ca)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 900, color: "#fff",
        boxShadow: `0 0 40px ${P}99`,
        fontFamily: "inherit",
      }}>
        {initial}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ModernTemplate({ content = {}, user = {} }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const ids = ["projects", "about", "home"];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 140) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Safe data
  const userName = user?.name && user.name !== "null null" ? user.name : "Professional";
  const userEmail = content?.contactEmail || user?.email || "hello@example.com";
  const headline = content?.headline || `${userName}.`;
  const aboutText = content?.aboutMe || "A passionate professional creating meaningful digital experiences.";
  const experience = Array.isArray(content?.experience) ? content.experience : [];
  const projects = Array.isArray(content?.projects) ? content.projects : [];
  const skills = Array.isArray(content?.skills) ? content.skills : [];
  const stats = Array.isArray(content?.stats) ? content.stats : [];
  const socials = Array.isArray(content?.socials) ? content.socials : [];
  const initial = userName.charAt(0).toUpperCase();

  const NAV = ["Home", "About", "Projects"];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        h1,h2,h3,.display{font-family:'Syne',sans-serif}

        @keyframes blink    {50%{opacity:0}}
        @keyframes spin     {to{transform:rotate(360deg)}}
        @keyframes rspin    {to{transform:rotate(-360deg)}}
        @keyframes floatUp  {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer  {0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulseglow{0%,100%{opacity:.4}50%{opacity:1}}

        .blink  {animation:blink 1.1s step-end infinite}
        .spin1  {animation:spin 16s linear infinite}
        .spin2  {animation:rspin 10s linear infinite}
        .spin3  {animation:pulseglow 3s ease-in-out infinite}
        .fi0    {animation:floatUp .9s cubic-bezier(.22,1,.36,1) both}
        .fi1    {animation:floatUp .9s cubic-bezier(.22,1,.36,1) .12s both}
        .fi2    {animation:floatUp .9s cubic-bezier(.22,1,.36,1) .24s both}
        .fi3    {animation:floatUp .9s cubic-bezier(.22,1,.36,1) .36s both}

        .shimmer-text{
          background:linear-gradient(120deg,#fff 0%,#a78bfa 40%,#fff 60%,#a78bfa 100%);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 5s linear infinite
        }

        .grid-bg{
          background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
          background-size:60px 60px
        }

        @media(max-width:768px){
          .proj-row{grid-template-columns:1fr!important}
          .nav-links{display:none!important}
          .hero-h1{font-size:clamp(12px,4vw,40px)!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .contact-row{flex-direction:column!important;align-items:flex-start!important}
        }
      `}</style>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 68,
        padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(8,0,16,.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid rgba(124,58,237,.12)` : "none",
        transition: "all .4s",
      }}>
        {/* Logo */}
        <a href="#home" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg,${P},#4338ca)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 18, color: "#fff",
            boxShadow: `0 0 20px ${P}55`,
          }}>ζ</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>{userName.split(" ")[0]}</span>
        </a>

        {/* Links */}
        <div className="nav-links" style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.04)", border: `1px solid ${BORDER}`, borderRadius: 40, padding: "6px 8px", backdropFilter: "blur(20px)" }}>
          {NAV.map(l => {
            const id = l.toLowerCase();
            const active = activeSection === id;
            return (
              <a key={l} href={`#${id}`} style={{
                padding: "6px 16px", borderRadius: 30, fontSize: 9, fontWeight: 900,
                letterSpacing: "0.15em", textTransform: "uppercase", transition: "all .3s",
                background: active ? P : "transparent",
                color: active ? "#fff" : "#9ca3af",
                boxShadow: active ? `0 0 15px ${P}55` : "none",
              }}>{l}</a>
            );
          })}
        </div>

        {/* CTA */}
        <Btn href={`mailto:${userEmail}`} style={{ height: 38, padding: "0 18px", fontSize: 10 }}>
          Hire Me <Icons.Arrow />
        </Btn>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "140px 24px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* BG blobs */}
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 900, height: 700, borderRadius: "50%", background: `radial-gradient(ellipse,${P}28 0%,transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", animation: "pulseglow 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: 80, right: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(99,102,241,.12) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        {/* Grid */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: .025, pointerEvents: "none" }} />

        {/* Badge */}
        <div className="fi0" style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.04)", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "14px 18px", marginBottom: 52, backdropFilter: "blur(20px)", textAlign: "left", maxWidth: 320, position: "relative" }}>
          <div style={{ position: "absolute", inset: -1, borderRadius: 20, padding: 1, background: `linear-gradient(135deg,${P}44,rgba(99,102,241,.2))`, WebkitMask: "linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none" }} />
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${P},#4338ca)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: `0 0 20px ${P}44` }}>🧑‍💻</div>
          <div>
            <p style={{ fontSize: 9, color: P, textTransform: "uppercase", letterSpacing: "0.3em", fontWeight: 900, marginBottom: 5 }}>Available for Work</p>
            <p style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.5, fontWeight: 400 }}>
              Turning <strong style={{ color: "#fff" }}>ideas</strong> into{" "}
              <em style={{ color: P, fontWeight: 700 }}>experiences</em>
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="fi1">
          <h1 className="shimmer-text hero-h1" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            {headline}
            <span className="blink" style={{ display: "inline-block", width: "0.05em", height: "0.82em", background: P, marginLeft: 8, verticalAlign: "middle", borderRadius: 4, boxShadow: `0 0 20px ${P}cc` }} />
          </h1>
          {(content?.currentRole || content?.currentCompany) && (
            <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
              {content.currentRole}{content.currentCompany && <span style={{ color: P }}> @ {content.currentCompany}</span>}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="fi2" style={{ marginTop: 24, maxWidth: 800 }}>
          <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.75, fontWeight: 300 }}>{aboutText}</p>
        </div>

        {/* CTAs */}
        <div className="fi3" style={{ display: "flex", gap: 12, marginTop: 44, flexWrap: "wrap", justifyContent: "center" }}>
          <Btn href="#projects">View Projects <Icons.Arrow /></Btn>
          <Btn href={`mailto:${userEmail}`} variant="outline"><Icons.Mail /> Get in Touch</Btn>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: .3, animation: "floatUp 2s ease-in-out infinite alternate" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#6b7280", fontWeight: 700 }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom,${P},transparent)`, borderRadius: 4 }} />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      {stats.length > 0 && (
        <section style={{ padding: "48px 24px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: "rgba(255,255,255,.01)" }}>
          <div className="stats-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)},1fr)`, gap: 24 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="shimmer-text" style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ────────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <SectionLabel>Career</SectionLabel>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.3px", marginBottom: 8 }}>Work Experience</h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 40, fontWeight: 300, lineHeight: 1.6, maxWidth: 400 }}>Roles and teams where I've shipped meaningful work.</p>

        {experience.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
            {experience.map((exp, i) => (
              <GlassCard key={i} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "default" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${P}22`, border: `1px solid ${P}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 6, background: P, opacity: Math.max(.4, 1 - i * .15), boxShadow: `0 0 12px ${P}` }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{exp.company}</p>
                  <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontWeight: 300 }}>{exp.role}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 900, color: P, background: `${P}18`, border: `1px solid ${P}33`, borderRadius: 20, padding: "4px 10px", flexShrink: 0, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{exp.duration}</span>
              </GlassCard>
            ))}
          </div>
        ) : (
          <p style={{ color: "#4b5563", fontSize: 14, fontStyle: "italic" }}>No experience added yet.</p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#d1d5db", marginBottom: 16, letterSpacing: "-0.5px" }}>Skills & Technologies</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((sk, i) => (
                <SkillPill key={i}>{sk}</SkillPill>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── ORBIT ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: `radial-gradient(ellipse,${P}22 0%,transparent 70%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        <OrbitVisual initial={initial} />
        <div style={{ marginTop: 36, textAlign: "center", maxWidth: 380 }}>
          <p style={{ fontSize: 15, color: "#d1d5db", fontWeight: 500 }}>
            Open to{" "}
            <span style={{ color: P, textDecoration: "underline dotted", textUnderlineOffset: 4, fontWeight: 700 }}>cross-functional</span>{" "}
            collaborations
          </p>
          <p style={{ fontSize: 12, color: "#4b5563", marginTop: 8, fontWeight: 300, lineHeight: 1.7 }}>
            Passionate about building accessible, impactful, and delightful digital experiences.
          </p>
        </div>
        {/* Social icons */}
        <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {socials.length > 0 ? socials.map((s, i) => (
            <SocialBtn key={i} href={s.url || "#"} label={s.platform}><Icons.Globe /></SocialBtn>
          )) : (
            [<Icons.Code key={0} />, <Icons.Mail key={1} />, <Icons.Globe key={2} />].map((icon, i) => (
              <SocialBtn key={i} href="#" label="Link">{icon}</SocialBtn>
            ))
          )}
        </div>
      </section>

      {/* ── PROJECTS ──────────────────────────────────────────────────────── */}
      <section id="projects" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <SectionLabel>Work</SectionLabel>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.3px", marginBottom: 8 }}>Featured Projects</h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 60, fontWeight: 300, lineHeight: 1.6, maxWidth: 400 }}>A curated selection of projects that showcase my skills.</p>

        {projects.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 100 }}>
            {projects.map((proj, i) => (
              <div key={i} className="proj-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
                {/* Text */}
                <div style={{ ...(i % 2 !== 0 ? { order: 2 } : {}), display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <SectionLabel>Featured Project</SectionLabel>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{proj.name}</h3>
                  </div>
                  <GlassCard hover={false} style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.7, fontWeight: 300 }}>{proj.description}</p>
                  </GlassCard>
                  {/* Tech tags */}
                  {Array.isArray(proj.tech) && proj.tech.length > 0 && (
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {proj.tech.map((t, j) => (
                        <span key={j} style={{ fontSize: 10, fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                          {t}{j < proj.tech.length - 1 && <span style={{ color: P, marginLeft: 8 }}>·</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn href={proj.githubUrl || "#"} variant="outline" style={{ height: 40, padding: "0 18px", fontSize: 10 }}>
                      <Icons.Code /> Code
                    </Btn>
                    <Btn href={proj.liveUrl || "#"} variant="outline" style={{ height: 40, padding: "0 18px", fontSize: 10 }}>
                      <Icons.External /> Live Demo
                    </Btn>
                  </div>
                </div>
                {/* Mockup */}
                <div style={{ ...(i % 2 !== 0 ? { order: 1 } : {}) }}>
                  <ProjectMockup />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16, opacity: .3 }}>
            <Icons.Layers />
            <p style={{ fontSize: 14, color: "#6b7280" }}>No projects added yet.</p>
          </div>
        )}
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", border: `1px solid ${BORDER}`, background: "rgba(255,255,255,.02)", padding: "60px 48px" }}>
          {/* glow */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 240, height: 240, borderRadius: "50%", background: `${P}22`, filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${P}0d,transparent 50%)`, pointerEvents: "none" }} />

          <div className="contact-row" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 420 }}>
              <SectionLabel>Contact</SectionLabel>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: 14 }}>
                Let&apos;s Build Something <em style={{ color: P }}>Together</em>
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                {content?.contactBio || "Open to new opportunities, collaborations, and exciting projects."}
              </p>
              <a href={`mailto:${userEmail}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: P, transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
                onMouseLeave={e => e.currentTarget.style.color = P}>
                <Icons.Mail /> {userEmail}
              </a>
            </div>
            <Btn href={`mailto:${userEmail}`} style={{ flexShrink: 0 }}>
              Let's Connect <Icons.Sparkle />
            </Btn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ padding: "40px 24px", borderTop: `1px solid ${BORDER}`, background: "rgba(0,0,0,.4)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg,${P},#4338ca)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", boxShadow: `0 0 15px ${P}44` }}>ζ</div>
            <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 700 }}>{userName}</span>
          </div>
          <p style={{ fontSize: 10, color: "#374151", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} {userName}
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {NAV.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 10, color: "#4b5563", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = P}
                onMouseLeave={e => e.currentTarget.style.color = "#4b5563"}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SkillPill({ children }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontSize: 11, fontWeight: 700, color: hov ? "#fff" : P, background: hov ? `${P}33` : `${P}18`, border: `1px solid ${hov ? P + "66" : P + "33"}`, borderRadius: 20, padding: "6px 14px", cursor: "default", transition: "all .2s" }}>
      {children}
    </span>
  );
}

function SocialBtn({ href, label, children }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 40, height: 40, borderRadius: "50%", background: hov ? `${P}22` : "rgba(255,255,255,.05)", border: `1px solid ${hov ? P + "55" : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: hov ? P : "#6b7280", transition: "all .25s" }}>
      {children}
    </a>
  );
}