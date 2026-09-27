import React, { useEffect, useRef } from 'react';
import {
  BoardAnimationType,
  BoardCustomColorConfig,
  BoardMediaBackground,
  ThemeConfig
} from '../types/keyboard';

interface BoardBackgroundProps {
  theme: ThemeConfig;
  animation: BoardAnimationType;
  animationSpeed?: number;
  mediaBackground?: BoardMediaBackground;
  customColors?: BoardCustomColorConfig;
  isBlankBoard?: boolean;
}

export const BoardBackground: React.FC<BoardBackgroundProps> = ({
  theme,
  animation = 'none',
  animationSpeed = 1,
  mediaBackground,
  customColors,
  isBlankBoard = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background Canvas Animation Loop
  useEffect(() => {
    if (isBlankBoard || animation === 'none' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle / Effect Initializers
    const speedMultiplier = Math.max(0.2, Math.min(2.5, animationSpeed));

    // 1. Bokeh Orbs State
    const orbs = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 18 + Math.random() * 32,
      vx: (Math.random() - 0.5) * 0.7 * speedMultiplier,
      vy: (Math.random() - 0.5) * 0.7 * speedMultiplier,
      color: [
        'rgba(168, 199, 250, 0.18)',
        'rgba(127, 207, 255, 0.15)',
        'rgba(197, 184, 255, 0.16)',
        'rgba(109, 213, 140, 0.14)',
      ][Math.floor(Math.random() * 4)],
    }));

    // 2. Matrix Rain State
    const matrixChars = '০১২৩৪৫৬৭৮৯অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ01TEXTQBOARD';
    const matrixCols = Math.floor(width / 16);
    const matrixDrops = Array.from({ length: matrixCols }, () =>
      Math.floor(Math.random() * -30)
    );

    // 3. Starry Night Dust State
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.2,
      alpha: Math.random(),
      fadeSpeed: (0.008 + Math.random() * 0.018) * speedMultiplier,
      vy: (0.1 + Math.random() * 0.3) * speedMultiplier,
    }));

    // 4. Falling Petals State
    const petals = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 4 + Math.random() * 6,
      vx: (Math.random() - 0.3) * 0.8 * speedMultiplier,
      vy: (0.6 + Math.random() * 1.2) * speedMultiplier,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04 * speedMultiplier,
      color: 'rgba(251, 186, 216, 0.35)',
    }));

    // 5. Neon Waves / Audio Spectrum State
    let waveTick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (animation === 'bokeh_orbs') {
        orbs.forEach((orb) => {
          orb.x += orb.vx;
          orb.y += orb.vy;

          if (orb.x < -orb.radius) orb.x = width + orb.radius;
          if (orb.x > width + orb.radius) orb.x = -orb.radius;
          if (orb.y < -orb.radius) orb.y = height + orb.radius;
          if (orb.y > height + orb.radius) orb.y = -orb.radius;

          const grad = ctx.createRadialGradient(
            orb.x,
            orb.y,
            0,
            orb.x,
            orb.y,
            orb.radius
          );
          grad.addColorStop(0, orb.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (animation === 'matrix_rain') {
        ctx.fillStyle = 'rgba(10, 20, 30, 0.2)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#7FCFFF';
        ctx.font = '11px monospace';

        matrixDrops.forEach((y, i) => {
          const char =
            matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * 16;
          ctx.fillText(char, x, y * 16);

          if (y * 16 > height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i] += 0.45 * speedMultiplier;
        });
      } else if (animation === 'starry_night') {
        stars.forEach((star) => {
          star.alpha += star.fadeSpeed;
          if (star.alpha > 1 || star.alpha < 0.1) {
            star.fadeSpeed = -star.fadeSpeed;
          }
          star.y -= star.vy;
          if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(227, 242, 255, ${Math.max(0.1, star.alpha * 0.7)})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (animation === 'falling_petals') {
        petals.forEach((p) => {
          p.x += p.vx + Math.sin(p.angle) * 0.4;
          p.y += p.vy;
          p.angle += p.spin;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (animation === 'neon_waves') {
        waveTick += 0.02 * speedMultiplier;
        ctx.lineWidth = 2;

        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.strokeStyle =
            j === 0
              ? 'rgba(168, 199, 250, 0.25)'
              : j === 1
              ? 'rgba(127, 207, 255, 0.2)'
              : 'rgba(255, 179, 173, 0.2)';

          const yOffset = height * (0.4 + j * 0.2);
          for (let x = 0; x < width; x += 10) {
            const y =
              yOffset +
              Math.sin(x * 0.02 + waveTick + j) * 14 +
              Math.cos(x * 0.015 - waveTick) * 8;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (animation === 'aurora_shift') {
        waveTick += 0.008 * speedMultiplier;
        const grad = ctx.createLinearGradient(
          0,
          0,
          width,
          height + Math.sin(waveTick) * 40
        );
        grad.addColorStop(
          0,
          `rgba(114, 246, 209, ${0.12 + Math.sin(waveTick) * 0.06})`
        );
        grad.addColorStop(
          0.5,
          `rgba(127, 207, 255, ${0.14 + Math.cos(waveTick) * 0.06})`
        );
        grad.addColorStop(
          1,
          `rgba(197, 184, 255, ${0.1 + Math.sin(waveTick * 1.2) * 0.05})`
        );

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (animation === 'cyber_grid') {
        waveTick += 0.4 * speedMultiplier;
        const horizon = height * 0.3;
        ctx.strokeStyle = 'rgba(214, 166, 255, 0.16)';
        ctx.lineWidth = 1;

        // Perspective vertical lines
        const vanishingX = width / 2;
        const numLines = 14;
        for (let i = 0; i <= numLines; i++) {
          const bottomX = (width / numLines) * i;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        // Horizontal moving lines
        const offset = waveTick % 18;
        for (let y = horizon; y < height; y += 18) {
          const actualY = y + offset;
          if (actualY >= horizon && actualY <= height) {
            ctx.beginPath();
            ctx.moveTo(0, actualY);
            ctx.lineTo(width, actualY);
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [animation, animationSpeed, isBlankBoard]);

  // Determine container styling (Blank Mode / Custom Colors / Theme Defaults)
  const isCustom = Boolean(customColors?.useCustomColors);
  const containerStyle: React.CSSProperties = isBlankBoard
    ? { backgroundColor: '#000000', backgroundImage: 'none' }
    : isCustom
    ? {
        backgroundColor: customColors?.boardBgColor || '#1b1b1f',
        backgroundImage: customColors?.boardGradient || undefined,
      }
    : {};

  const hasMedia =
    !isBlankBoard &&
    mediaBackground &&
    mediaBackground.type !== 'none' &&
    Boolean(mediaBackground.url);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none transition-colors duration-300 ${
        !isCustom && !isBlankBoard ? theme.boardBg : ''
      }`}
      style={containerStyle}
    >
      {/* 1. Uploaded Photo, GIF, or Video Wallpaper Layer */}
      {hasMedia && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {mediaBackground?.type === 'video' ? (
            <video
              src={mediaBackground.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${mediaBackground.brightness ?? 1}) blur(${
                  mediaBackground.blur ?? 0
                }px)`,
              }}
            />
          ) : (
            <img
              src={mediaBackground?.url}
              alt="Keyboard Board Wallpaper"
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${mediaBackground?.brightness ?? 1}) blur(${
                  mediaBackground?.blur ?? 0
                }px)`,
              }}
            />
          )}

          {/* Dimmer Overlay to guarantee 100% key legibility */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: mediaBackground?.dimmerOpacity ?? 0.45 }}
          />
        </div>
      )}

      {/* 2. Interactive HTML5 Canvas Animation Layer */}
      {!isBlankBoard && animation !== 'none' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
};
