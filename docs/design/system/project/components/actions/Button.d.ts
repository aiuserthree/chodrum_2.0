import * as React from 'react';

/**
 * The brand's primary action control. Solid Ink for primary commands, bordered
 * white for secondary, text-only for ghost. 8px radius, weight 500, no shadow.
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual hierarchy. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Lucide icon name shown before the label. */
  iconLeft?: string;
  /** Lucide icon name shown after the label. */
  iconRight?: string;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
