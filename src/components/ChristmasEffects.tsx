'use client';

import { useEffect, useState } from 'react';
import { Snowfall } from 'react-snowfall';

interface GiftBox {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

const ChristmasEffects = () => {
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Client-side only
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Create gift boxes - fewer on mobile for performance
      const boxCount = mobile ? 5 : 10;
      const boxes: GiftBox[] = Array.from({ length: boxCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // Percentage of screen width
        duration: Math.random() * 5 + 3, // 3-8 seconds
        delay: Math.random() * 5, // 0-5 seconds delay
        size: Math.random() * 30 + 30, // 30-60px
      }));

      setGiftBoxes(boxes);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <>
      {/* Kar Efekti */}
      <Snowfall
        color="#fff"
        snowflakeCount={isMobile ? 50 : 100}
        speed={[0.5, 3]}
        wind={[-0.5, 2]}
        radius={[0.5, 3]}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1,
          top: 0,
          left: 0,
        }}
      />

      {/* Hediye Kutuları */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {giftBoxes.map((box) => (
          <div
            key={box.id}
            className="gift-box"
            style={{
              position: 'absolute',
              left: `${box.left}%`,
              top: '-100px',
              width: `${box.size}px`,
              height: `${box.size}px`,
              animation: `fall-gift ${box.duration}s linear infinite`,
              animationDelay: `${box.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ChristmasEffects;

