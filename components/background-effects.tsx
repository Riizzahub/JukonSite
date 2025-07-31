"use client"

import { useEffect, useRef } from "react"

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      opacity: number
    }> = []

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? "#8A2BE2" : "#FF0000",
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    // Energy waves
    let waveOffset = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw energy waves
      waveOffset += 0.02
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.strokeStyle = i % 2 === 0 ? "rgba(138, 43, 226, 0.1)" : "rgba(255, 0, 0, 0.1)"
        ctx.lineWidth = 2

        for (let x = 0; x < canvas.width; x += 10) {
          const y = canvas.height / 2 + Math.sin(x * 0.01 + waveOffset + i * 2) * 100
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Draw and update particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1

        // Add glow effect
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity * 0.1
        ctx.fill()
        ctx.globalAlpha = 1
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="background-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Pulsating gradient circles */}
      <div className="gradient-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-4"></div>
      </div>

      <style jsx>{`
        .gradient-circles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: pulse-move 20s ease-in-out infinite;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 0, 0, 0.2) 0%, transparent 70%);
          top: 60%;
          right: 10%;
          animation-delay: 5s;
        }

        .circle-3 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 0, 255, 0.15) 0%, transparent 70%);
          bottom: 20%;
          left: 30%;
          animation-delay: 10s;
        }

        .circle-4 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(148, 0, 211, 0.25) 0%, transparent 70%);
          top: 30%;
          right: 30%;
          animation-delay: 15s;
        }

        @keyframes pulse-move {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(50px, -30px) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-30px, 50px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translate(30px, 30px) scale(1.05);
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  )
}
