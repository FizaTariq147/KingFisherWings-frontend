import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/features/portal-auth/components/portal-ui/usePrefersReducedMotion';

type TextGenerateEffectProps = {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
};

/** Aceternity UI Text Generate Effect — display text only. */
export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.45,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const reduceMotion = usePrefersReducedMotion();
  const wordsArray = words.split(' ');

  useEffect(() => {
    if (reduceMotion) {
      void animate('span', { opacity: 1, filter: 'none' }, { duration: 0 });
      return;
    }
    void animate(
      'span',
      { opacity: 1, filter: filter ? 'blur(0px)' : 'none' },
      { duration, delay: stagger(0.12) },
    );
  }, [animate, duration, filter, reduceMotion, words]);

  return (
    <div className={cn('font-normal', className)}>
      <motion.div ref={scope} className="leading-relaxed">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="opacity-0"
            style={{ filter: reduceMotion || !filter ? 'none' : 'blur(8px)' }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
