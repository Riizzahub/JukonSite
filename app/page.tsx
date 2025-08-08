"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AudioPlayer } from "@/components/audio-player"
import { BackgroundEffects } from "@/components/background-effects"

export default function CreativeLanding() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const blocks = [
    {
      id: 1,
      title: "Immortal",
      url: "https://roblox.tg/dashboard/?code=NDQ2Mzc3MzE1MTQ4MDc5NTM2Mg==",
      animation: "wave-deform",
      gradient: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      glowColor: "#3b82f6",
    },
    {
      id: 2,
      title: "Splunk",
      url: "https://app.diddyblud.live/u/SpIank",
      animation: "wave-deform",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      glowColor: "#10b981",
    },
    {
      id: 3,
      title: "Injuries",
      url: "https://www.logged.tg/auth/jukon",
      animation: "wave-deform",
      gradient: "linear-gradient(135deg, #2d1b69 0%, #1e1b4b 50%, #312e81 100%)",
      glowColor: "#8b5cf6",
    },
    {
      id: 4,
      title: "Soon",
      url: "#",
      animation: "wave-deform",
      gradient: "linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 50%, #3a3a3a 100%)",
      glowColor: "#6b7280",
    },
    {
      id: 5,
      title: "Soon",
      url: "#",
      animation: "wave-deform",
      gradient: "linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 50%, #3a3a3a 100%)",
      glowColor: "#6b7280",
    },
    {
      id: 6,
      title: "Soon",
      url: "#",
      animation: "wave-deform",
      gradient: "linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 50%, #3a3a3a 100%)",
      glowColor: "#6b7280",
    },
  ]

  if (!mounted) return null

  return (
    <div className="creative-landing">
      <BackgroundEffects />

      {/* Main Content */}
      <div className="main-content">
        <header className="hero-section">
          <h1 className="hero-title">
            <span className="title-part">JUKON</span>
            <span className="title-part neon">BEAM</span>
          </h1>
          <p className="hero-subtitle">Welcome to beaming community</p>
        </header>

        {/* Blocks Grid */}
        <div className="blocks-grid">
          {blocks.map((block) => (
            <div key={block.id} className={`block ${block.animation}`} data-block={block.id}>
              <div
                className="block-inner"
                style={
                  {
                    background: block.gradient,
                    "--glow-color": block.glowColor,
                  } as React.CSSProperties
                }
              >
                <div className="block-content">
                  <h2 className="block-title">{block.title}</h2>
                  {block.title === "Soon" ? (
                    <div className="coming-soon-btn">
                      <span className="btn-text">Coming Soon</span>
                      <div className="btn-glow"></div>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                  ) : (
                    <Link
                      href={block.url}
                      className="dashboard-btn"
                      target={block.url.startsWith("http") ? "_blank" : "_self"}
                      rel={block.url.startsWith("http") ? "noopener noreferrer" : ""}
                    >
                      <span className="btn-text">Dashboard</span>
                      <div className="btn-glow"></div>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                      </svg>
                    </Link>
                  )}
                </div>
                <div className="block-overlay"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Discord Button */}
        <div className="discord-section">
          <Link href="" target="_blank" rel="noopener noreferrer" className="discord-btn">
            <svg className="discord-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="discord-text">Join Discord Server</span>
            <svg className="discord-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </div>
      </div>

      <AudioPlayer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600&display=swap');

        .creative-landing {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          font-family: 'Exo 2', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .main-content {
          position: relative;
          z-index: 10;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
          padding: 4rem 0;
        }

        .hero-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(3rem, 8vw, 8rem);
          font-weight: 900;
          margin: 0;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .title-part {
          display: inline-block;
          background: linear-gradient(45deg, #8A2BE2, #FF0000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0.2em;
          animation: title-glow 3s ease-in-out infinite alternate;
        }

        .title-part.neon {
          background: linear-gradient(45deg, #FF00FF, #9400D3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px #FF00FF;
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes title-glow {
          0% { filter: brightness(1) saturate(1); }
          100% { filter: brightness(1.2) saturate(1.5); }
        }

        @keyframes neon-pulse {
          0% { 
            text-shadow: 0 0 30px #FF00FF, 0 0 60px #FF00FF;
            transform: scale(1);
          }
          100% { 
            text-shadow: 0 0 50px #FF00FF, 0 0 100px #FF00FF, 0 0 150px #FF00FF;
            transform: scale(1.02);
          }
        }

        .hero-subtitle {
          font-size: clamp(1rem, 3vw, 1.5rem);
          margin-top: 1rem;
          opacity: 0.8;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* Blocks Grid */
        .blocks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .blocks-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Block Styles */
        .block {
          position: relative;
          height: 280px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .block-inner {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .block-content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2rem;
        }

        .block-title {
          font-family: 'Orbitron', monospace;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          color: #ffffff;
        }

        .dashboard-btn, .coming-soon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1.2rem 2.5rem;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 50px;
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          align-self: flex-start;
          overflow: hidden;
          font-family: 'Orbitron', monospace;
        }

        .coming-soon-btn {
          cursor: default;
          opacity: 0.7;
          border-color: rgba(107, 114, 128, 0.5);
        }

        .btn-text {
          position: relative;
          z-index: 2;
        }

        .btn-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.6s ease;
          z-index: 1;
        }

        .dashboard-btn:hover .btn-glow {
          left: 100%;
        }

        .dashboard-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--glow-color, #ffffff);
          color: #ffffff;
          transform: translateY(-4px) scale(1.05);
          box-shadow: 
            0 15px 50px rgba(0, 0, 0, 0.6),
            0 0 30px var(--glow-color, rgba(255, 255, 255, 0.5)),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          text-shadow: 0 0 20px var(--glow-color, rgba(255, 255, 255, 0.8));
        }

        .btn-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .dashboard-btn:hover .btn-icon {
          transform: translateX(6px) rotate(45deg);
        }

        .block-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          z-index: 1;
        }

        /* Wave Deform Animation */
        .wave-deform:hover .block-inner {
          animation: wave-deform 0.6s ease-in-out;
          border-color: var(--glow-color, #ffffff);
          box-shadow: 
            0 0 50px var(--glow-color, rgba(255, 255, 255, 0.3)),
            0 0 100px var(--glow-color, rgba(255, 255, 255, 0.2)),
            inset 0 0 50px var(--glow-color, rgba(255, 255, 255, 0.05));
          transform: scale(1.02);
        }

        @keyframes wave-deform {
          0%, 100% {
            border-radius: 20px;
            transform: scale(1.02);
          }
          25% {
            border-radius: 20px 40px 20px 40px;
            transform: scale(1.02) rotate(0.5deg);
          }
          50% {
            border-radius: 40px 20px 40px 20px;
            transform: scale(1.02) rotate(-0.5deg);
          }
          75% {
            border-radius: 30px 10px 30px 10px;
            transform: scale(1.02) rotate(0.3deg);
          }
        }

        .wave-deform:hover .block-overlay {
          background: var(--glow-color, rgba(255, 255, 255, 0.1));
          opacity: 0.1;
        }

        .wave-deform:hover .block-title {
          text-shadow: 0 0 30px var(--glow-color, #ffffff), 0 0 60px var(--glow-color, #ffffff);
          animation: text-wave 0.6s ease-in-out;
        }

        @keyframes text-wave {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px) rotate(0.5deg); }
          50% { transform: translateY(2px) rotate(-0.5deg); }
          75% { transform: translateY(-1px) rotate(0.3deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .blocks-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .block {
            height: 240px;
          }

          .block-content {
            padding: 1.5rem;
          }

          .block-title {
            font-size: 1.5rem;
          }

          .hero-section {
            padding: 2rem 0;
            margin-bottom: 2rem;
          }

          .dashboard-btn, .coming-soon-btn {
            padding: 1rem 2rem;
            font-size: 0.9rem;
            gap: 0.6rem;
          }
        }

        @media (max-width: 480px) {
          .block {
            height: 200px;
          }

          .block-content {
            padding: 1rem;
          }

          .dashboard-btn, .coming-soon-btn {
            padding: 0.8rem 1.5rem;
            font-size: 0.8rem;
          }
        }

        /* Discord Section */
        .discord-section {
          text-align: center;
          margin-top: 4rem;
          padding: 2rem 0;
        }

        .discord-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 3rem;
          background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
          border: 2px solid rgba(88, 101, 242, 0.5);
          border-radius: 60px;
          color: #ffffff;
          text-decoration: none;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 10px 40px rgba(88, 101, 242, 0.3),
            0 0 0 1px rgba(88, 101, 242, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .discord-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .discord-btn:hover::before {
          left: 100%;
        }

        .discord-btn:hover {
          background: linear-gradient(135deg, #6B73FF 0%, #5865F2 100%);
          border-color: rgba(107, 115, 255, 0.8);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 20px 60px rgba(88, 101, 242, 0.4),
            0 0 100px rgba(107, 115, 255, 0.3),
            0 0 0 1px rgba(107, 115, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .discord-btn:active {
          transform: translateY(-2px) scale(1.01);
        }

        .discord-icon {
          width: 28px;
          height: 28px;
          transition: all 0.3s ease;
        }

        .discord-text {
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .discord-arrow {
          width: 24px;
          height: 24px;
          transition: all 0.3s ease;
        }

        .discord-btn:hover .discord-icon {
          transform: rotate(12deg) scale(1.1);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }

        .discord-btn:hover .discord-text {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .discord-btn:hover .discord-arrow {
          transform: translateX(6px) rotate(45deg);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }

        /* Discord Button Responsive */
        @media (max-width: 768px) {
          .discord-section {
            margin-top: 3rem;
            padding: 1.5rem 0;
          }

          .discord-btn {
            padding: 1.2rem 2.5rem;
            font-size: 1rem;
            gap: 0.8rem;
          }

          .discord-icon {
            width: 24px;
            height: 24px;
          }

          .discord-text {
            font-size: 1rem;
          }

          .discord-arrow {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .discord-btn {
            padding: 1rem 2rem;
            font-size: 0.9rem;
            gap: 0.6rem;
          }

          .discord-icon {
            width: 20px;
            height: 20px;
          }

          .discord-text {
            font-size: 0.9rem;
          }

          .discord-arrow {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  )
}
