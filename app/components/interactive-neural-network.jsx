"use client";

import React, { useEffect, useRef } from "react";

export default function InteractiveNeuralNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;
    let particles = [];
    let maxParticles = 60;
    const connectionDistance = 100;

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 400;
      
      // Scale particles based on container size
      if (canvas.width < 640) {
        maxParticles = 25;
      } else {
        maxParticles = 60;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 2 + 0.8;
        this.type = Math.random() > 0.4 ? "sparkle" : "dot";
        this.glowBlur = Math.random() * 6 + 4;
        
        // Colors that match Sage AI theme: indigos, purples, and electric blue/cyan accents
        const colors = [
          { fill: "rgba(129, 140, 248, 0.85)", shadow: "#818cf8" },
          { fill: "rgba(167, 139, 250, 0.85)", shadow: "#a78bfa" },
          { fill: "rgba(99, 102, 241, 0.85)", shadow: "#6366f1" },
          { fill: "rgba(34, 211, 238, 0.75)", shadow: "#22d3ee" } // Electric cyan accent
        ];
        const colorPick = colors[Math.floor(Math.random() * colors.length)];
        this.color = colorPick.fill;
        this.shadowColor = colorPick.shadow;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        
        if (this.type === "sparkle") {
          // Draw a 4-pointed star shape
          ctx.moveTo(0, -this.radius * 2.2);
          ctx.quadraticCurveTo(0, 0, this.radius * 2.2, 0);
          ctx.quadraticCurveTo(0, 0, 0, this.radius * 2.2);
          ctx.quadraticCurveTo(0, 0, -this.radius * 2.2, 0);
          ctx.quadraticCurveTo(0, 0, 0, -this.radius * 2.2);
        } else {
          // Draw a small dot
          ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }
        
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.glowBlur;
        ctx.shadowColor = this.shadowColor;
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ensure particles match current maxParticles cap dynamically
      while (particles.length < maxParticles) {
        particles.push(new Particle());
      }
      if (particles.length > maxParticles) {
        particles.length = maxParticles;
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawLines();
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50" 
    />
  );
}
