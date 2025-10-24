import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star class for twinkling stars
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.baseOpacity = Math.random() * 0.7 + 0.3;
        this.twinkleSpeed = Math.random() * 0.05 + 0.02;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.color = this.getStarColor();
      }

      getStarColor() {
        const colors = [
          'rgba(255, 255, 255, ', // White
          'rgba(200, 220, 255, ', // Blue-white
          'rgba(255, 240, 220, ', // Yellow-white
          'rgba(220, 200, 255, ', // Purple-white
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update(time) {
        // Twinkling effect
        this.opacity = this.baseOpacity + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3;
      }

      draw() {
        // Draw star with glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, this.color + this.opacity + ')');
        gradient.addColorStop(0.5, this.color + (this.opacity * 0.5) + ')');
        gradient.addColorStop(1, this.color + '0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw bright center
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '1)';
        ctx.fill();
      }
    }

    // Shooting star class
    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 4;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        this.opacity = 0;
        this.fadeIn = true;
        this.life = 0;
        this.maxLife = Math.random() * 60 + 40;
      }

      update() {
        this.life++;
        
        if (this.fadeIn && this.opacity < 1) {
          this.opacity += 0.05;
          if (this.opacity >= 1) this.fadeIn = false;
        } else if (!this.fadeIn) {
          this.opacity -= 0.02;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.opacity <= 0 || this.life > this.maxLife || 
            this.x > canvas.width || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        if (this.opacity <= 0) return;

        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Flowing particle system for galaxy effect
    class GalaxyParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.vz = Math.random() * 1.5 + 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() * 60 + 240; // Purple to blue range
      }

      update() {
        this.z -= this.vz;
        if (this.z <= 0) {
          this.reset();
          this.z = 1000;
        }

        // 3D projection
        const scale = 1000 / (1000 + this.z);
        this.projectedX = (this.x - canvas.width / 2) * scale + canvas.width / 2;
        this.projectedY = (this.y - canvas.height / 2) * scale + canvas.height / 2;
        this.projectedSize = this.size * scale;
      }

      draw() {
        const alpha = this.opacity * (1 - this.z / 1000);
        ctx.beginPath();
        ctx.arc(this.projectedX, this.projectedY, this.projectedSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${alpha})`;
        ctx.fill();
      }
    }

    // Create stars (static twinkling background)
    const stars = Array.from({ length: 200 }, () => new Star());
    
    // Create shooting stars
    const shootingStars = Array.from({ length: 3 }, () => new ShootingStar());
    
    // Create galaxy particles (flowing)
    const galaxyParticles = Array.from({ length: 150 }, () => new GalaxyParticle());

    // Gradient orbs
    class GradientOrb {
      constructor(x, y, radius, color1, color2) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color1 = color1;
        this.color2 = color2;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.002 + 0.001;
        this.distance = Math.random() * 100 + 50;
      }

      update(time) {
        this.angle += this.speed;
        this.x = this.baseX + Math.cos(this.angle + time * 0.001) * this.distance;
        this.y = this.baseY + Math.sin(this.angle + time * 0.001) * this.distance;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Create gradient orbs
    const orbs = [
      new GradientOrb(canvas.width * 0.2, canvas.height * 0.3, 300, 'rgba(102, 126, 234, 0.3)', 'rgba(102, 126, 234, 0)'),
      new GradientOrb(canvas.width * 0.8, canvas.height * 0.7, 350, 'rgba(118, 75, 162, 0.3)', 'rgba(118, 75, 162, 0)'),
      new GradientOrb(canvas.width * 0.5, canvas.height * 0.5, 250, 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0)'),
      new GradientOrb(canvas.width * 0.7, canvas.height * 0.2, 280, 'rgba(167, 139, 250, 0.25)', 'rgba(167, 139, 250, 0)'),
    ];

    // Wave effect
    const drawWaves = (time) => {
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
                    Math.sin(x * 0.01 + time * 0.001 + i * 2) * 30 +
                    Math.sin(x * 0.005 + time * 0.002 + i) * 20;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 - i * 0.01})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    // Mesh grid
    const drawMesh = (time) => {
      const gridSize = 80;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize + Math.sin(time * 0.001 + j * 0.5) * 10;
          const y = j * gridSize + Math.cos(time * 0.001 + i * 0.5) * 10;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Horizontal lines
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
          const x = i * gridSize + Math.sin(time * 0.001 + j * 0.5) * 10;
          const y = j * gridSize + Math.cos(time * 0.001 + i * 0.5) * 10;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    // Animation loop
    const animate = () => {
      time += 1;

      // Create deep space gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#1a0b2e'); // Deep purple center
      gradient.addColorStop(0.5, '#2d1b4e'); // Mid purple
      gradient.addColorStop(1, '#0f0520'); // Dark space edge
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add nebula effect (subtle color clouds)
      const nebulaGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.5
      );
      nebulaGradient.addColorStop(0, 'rgba(102, 126, 234, 0.15)');
      nebulaGradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nebulaGradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, canvas.width * 0.4
      );
      nebulaGradient2.addColorStop(0, 'rgba(118, 75, 162, 0.12)');
      nebulaGradient2.addColorStop(1, 'rgba(118, 75, 162, 0)');
      ctx.fillStyle = nebulaGradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update orbs (galaxy cores)
      orbs.forEach(orb => {
        orb.update(time);
        orb.draw();
      });

      // Draw twinkling stars (background layer)
      stars.forEach(star => {
        star.update(time);
        star.draw();
      });

      // Draw flowing galaxy particles (middle layer)
      galaxyParticles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw shooting stars (foreground layer)
      shootingStars.forEach(star => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
}
