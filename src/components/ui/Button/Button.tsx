import { cn } from '../../../lib/utils';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
  isValidElement,
} from 'react';
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

/** Flatten simple text children for Add/Create label detection (no deep recursion). */
function labelText(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children).trim();
  }
  if (Array.isArray(children)) {
    return children.map(labelText).filter(Boolean).join(' ').trim();
  }
  // Only descend into element props.children — never Children.toArray(element),
  // which re-wraps the same node and can recurse forever (e.g. SVG icons).
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return labelText(children.props.children);
  }
  return '';
}

/**
 * Add / Create actions use the `create` variant (sidebar navy) unless an
 * explicit non-primary chrome/status variant was passed.
 */
function resolveVariant(
  variant: ButtonVariantProps['variant'] | undefined,
  children: ReactNode,
  ariaLabel?: string,
): ButtonVariantProps['variant'] {
  if (variant && variant !== 'primary') return variant;
  const key = (ariaLabel ?? labelText(children)).trim().toLowerCase();
  if (
    key === 'create' ||
    key.startsWith('create ') ||
    key === 'add' ||
    key.startsWith('add ')
  ) {
    return 'create';
  }
  return variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, type = 'button', title, leftIcon, children, style, ...props },
    ref,
  ) => {
    const resolved = resolveVariant(variant, children, props['aria-label']);
    return (
      <button
        ref={ref}
        type={type}
        title={title}
        aria-label={props['aria-label'] ?? (size === 'icon' ? title : undefined)}
        className={cn(buttonVariants({ variant: resolved, size }), className)}
        style={
          isColoredButtonVariant(resolved)
            ? { ...COLORED_BUTTON_STYLE[resolved], ...style }
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
    );
  },
);
Button.displayName = 'Button';
