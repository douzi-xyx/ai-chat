/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MousePointer } from "lucide-react";

export default function ButtonGlobal({children}:{children: React.ReactNode}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Generate cursor positions in concentric circles - with visual richness and performance
  const cursors = useMemo(() => {
    const cursors: any[] = [];
    // Increased circle radii to be further from the button
    const circles = [140, 180, 220, 260]; // Slightly bigger circles
    const cursorsPerCircle = [8, 12, 16, 20]; // Restored original cursor counts
    
    circles.forEach((radius, circleIndex) => {
      const count = cursorsPerCircle[circleIndex];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Calculate rotation to point outward from button center (0, 0)
        const rotationOutward = Math.atan2(y, x) * (180 / Math.PI);
        
        // Main cursor
        cursors.push({
          id: `cursor-${circleIndex}-${i}`,
          finalX: x,
          finalY: y,
          delay: circleIndex * 0.01 + i * 0.002,
          rotation: rotationOutward,
          isTrail: false,
          opacity: 1,
          scale: 1
        });

        // Trail cursors (2 trailing elements for performance balance)
        for (let t = 1; t <= 2; t++) {
          cursors.push({
            id: `cursor-${circleIndex}-${i}-trail-${t}`,
            finalX: x,
            finalY: y,
            delay: circleIndex * 0.01 + i * 0.002 + t * 0.008,
            rotation: rotationOutward,
            isTrail: true,
            opacity: 1 - (t * 0.3),
            scale: 1 - (t * 0.2)
          });
        }
      }
    });
    
    return cursors;
  }, []);

  return (
    <div
      className="relative backdrop-blur-md  box-border content-stretch flex flex-row gap-0.5 items-center justify-center left-1/2  rounded-[38px] translate-x-[-50%] translate-y-[-50%] transition-all duration-300   hover:scale-105 group overflow-visible z-20 will-change-transform cursor-pointer"
      data-name="Button-global"
      style={{ top: "calc(50% - 0.5px)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-[38px]" />
      
      {/* Pulsing glow effect */}
      <motion.div
        className="w-full absolute inset-0 rounded-[38px] opacity-0 will-change-transform"
        animate={(isHovered || isActive) ? {
          opacity: [0, 0.6, 0],
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 0px rgba(255,255,255,0)",
            "0 0 20px rgba(255,255,255,0.4)",
            "0 0 0px rgba(255,255,255,0)"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-[38px]" />
      
      {/* Flying Cursors - Visual richness with performance optimizations */}
      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            className="absolute pointer-events-none will-change-transform z-10"
            style={{ 
              left: '50%', 
              top: 'calc(50% - 0.5px)',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {cursors.map((cursor) => (
              <motion.div
                key={cursor.id}
                className="absolute pointer-events-none will-change-transform"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  x: cursor.finalX,
                  y: cursor.finalY,
                  opacity: cursor.isTrail ? cursor.opacity : [1, 0.8, 1],
                  scale: cursor.isTrail ? cursor.scale : [1, 1.1, 1]
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  transition: { duration: 0.03 }
                }}
                transition={{
                  duration: 0.08,
                  delay: cursor.delay,
                  ease: "easeOut",
                  type: "spring",
                  damping: 25,
                  stiffness: 400,
                  opacity: {
                    duration: cursor.isTrail ? 0.08 : 2,
                    repeat: cursor.isTrail ? 0 : Infinity,
                    ease: "easeInOut"
                  },
                  scale: {
                    duration: cursor.isTrail ? 0.08 : 2,
                    repeat: cursor.isTrail ? 0 : Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <MousePointer 
                  className="w-5 h-5 text-white drop-shadow-lg" 
                  style={{ 
                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
                    opacity: cursor.opacity,
                    transform: `scale(${cursor.scale}) rotate(${cursor.rotation}deg)`
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
      {/* <button
            
            className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 hover:from-sky-500 hover:via-cyan-500 hover:to-teal-500 text-white rounded-2xl transition-all font-medium active:scale-[0.98]"
          >
            + 新建对话
          </button> */}
      {/* <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.7px] z-10 drop-shadow-lg">
        <p className="adjustLetterSpacing block leading-[1.4] whitespace-pre">
          {text}
        </p>
      </div> */}
    </div>
  );
}