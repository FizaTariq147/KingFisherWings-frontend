import { memo, useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BEAM_PATHS = [
  'M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875',
  'M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843',
  'M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811',
  'M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779',
  'M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747',
  'M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715',
  'M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683',
  'M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651',
  'M-156 -445C-156 -445 -88 -40 376 87C840 214 908 619 908 619',
  'M-128 -477C-128 -477 -60 -72 404 55C868 182 936 587 936 587',
  'M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555',
  'M-72 -541C-72 -541 -4 -136 460 -9C924 118 992 523 992 523',
  'M-44 -573C-44 -573 24 -168 488 -41C952 86 1020 491 1020 491',
  'M-16 -605C-16 -605 52 -200 516 -73C980 54 1048 459 1048 459',
];

/** Aceternity UI Background Beams — decorative SVG paths only. */
export const BackgroundBeams = memo(function BackgroundBeams({
  className,
}: {
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const delays = useMemo(
    () => BEAM_PATHS.map((_, i) => (i * 0.7) % 8),
    [],
  );

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute z-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {BEAM_PATHS.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            stroke={`url(#${uid}-grad-${index})`}
            strokeOpacity="0.45"
            strokeWidth="0.6"
            fill="none"
          />
        ))}

        <defs>
          {BEAM_PATHS.map((_, index) => (
            <motion.linearGradient
              id={`${uid}-grad-${index}`}
              key={`grad-${index}`}
              initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
              animate={{
                x1: ['0%', '100%'],
                x2: ['0%', '95%'],
                y1: ['0%', '100%'],
                y2: ['0%', `${90 + (index % 8)}%`],
              }}
              transition={{
                duration: 12 + (index % 5),
                ease: 'easeInOut',
                repeat: Infinity,
                delay: delays[index],
              }}
            >
              <stop stopColor="var(--color-secondary)" stopOpacity="0" />
              <stop offset="0.45" stopColor="var(--color-secondary)" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </motion.linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
});
