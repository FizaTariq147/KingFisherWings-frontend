import { cn } from '../../../lib/utils';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import {
  buttonVariants,
  COLORED_BUTTON_STYLE,
  isColoredButtonVariant,
  type ButtonVariantProps,
} from './buttonVariants';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** Optional leading icon (Fresa chrome — pair every labeled action with an icon). */
  leftIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, type = 'button', title, leftIcon, children, style, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      title={title}
      aria-label={props['aria-label'] ?? (size === 'icon' ? title : undefined)}
      className={cn(buttonVariants({ variant, size }), className)}
      style={
        isColoredButtonVariant(variant)
          ? { ...COLORED_BUTTON_STYLE[variant], ...style }
          : style
      }
      {...props}
    >
      {leftIcon ? (
        <span className="inline-flex shrink-0 items-center [&_svg]:h-3.5 [&_svg]:w-3.5" aria-hidden>
          {leftIcon}
        </span>
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
