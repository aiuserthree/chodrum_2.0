import * as React from 'react';

/**
 * A square, label-less action button (favourite, close, menu, quantity steppers).
 * Shares Button's hierarchy: solid / bordered / ghost.
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Lucide icon name. */
  name: string;
  /** @default "ghost" */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Pill (fully round) instead of 8px square. @default false */
  round?: boolean;
  /** Accessible label (required for icon-only controls). */
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
