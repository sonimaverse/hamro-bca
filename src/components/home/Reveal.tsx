import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  /** Delay in seconds before the element animates in. */
  delay?: number;
  /** Travel distance in pixels. Ignored when reduced motion is requested. */
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}

/**
 * Scroll-triggered fade/rise wrapper.
 * Uses IntersectionObserver via `whileInView` and degrades to a plain
 * fade for users who prefer reduced motion.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  y = 24,
  className = '',
  as = 'div',
}) => {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.6,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
};
